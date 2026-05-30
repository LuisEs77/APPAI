import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interfaz para resultado del procesamiento de factura
 */
export interface ResultadoFactura {
  comercio: string;
  fecha: string; // YYYY-MM-DD
  categoria: string;
  total: number;
  imagenHash: string;
}

/**
 * Servicio de IA
 * Integra servicios de IA (como Ollama) para extraer datos de facturas
 * Prompt ultra-conciso para optimizacion de tokens
 */
@Injectable()
export class IaService {
  private readonly logger = new Logger('IaService');
  private readonly iaApiUrl =
    process.env.IA_API_URL || 'http://localhost:11434';
  private readonly iaModel =
    process.env.IA_MODEL || 'neural-chat';
  private readonly promptPath = path.join(
    __dirname,
    'prompts',
    'extractor-factura-v2.txt',
  );

  constructor(private readonly httpService: HttpService) {}

  /**
   * Procesar imagen de factura con IA
   * @param imagenBase64 Imagen en formato base64
   * @returns Datos extraidos de la factura
   */
  async procesarFactura(imagenBase64: string): Promise<ResultadoFactura> {
    try {
      // Generar hash de imagen para evitar duplicados
      const imagenHash = this.generarHashImagen(imagenBase64);

      // Limpiar prefijo base64 si existe (Ollama solo quiere la data)
      const base64Limpio = (imagenBase64.includes(';base64,')
        ? imagenBase64.split(';base64,').pop()
        : imagenBase64) || '';

      // Leer prompt optimizado
      const prompt = this.leerPrompt();

      // Log del tamaño para detectar problemas de límites en Ngrok
      const tamanoKB = Math.round(base64Limpio.length * 0.75 / 1024);
      const urlCompleta = `${this.iaApiUrl}/api/generate`;
      
      this.logger.log(`Enviando a: ${urlCompleta}`);
      this.logger.log(`Modelo solicitado: ${this.iaModel}`);
      this.logger.log(`Tamaño estimado: ${tamanoKB}KB`);

      if (tamanoKB > 10000) {
        this.logger.warn('La imagen es muy grande (>10MB). Esto podría causar un error 403/413 en túneles gratuitos de Ngrok.');
      }
      
      const respuesta = await this.httpService.axiosRef.post(
        urlCompleta,
        {
          model: this.iaModel,
          prompt: prompt,
          images: [base64Limpio],
          stream: false,
          num_predict: 400,
          temperature: 0.1,
          top_k: 20,
          top_p: 0.9,
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 60000, // 60 segundos
        },
      );

      // Parsear respuesta JSON de la IA
      if (!respuesta.data || !respuesta.data.response) {
        throw new Error('Respuesta vacía de la IA');
      }

      const datosExtraidos = this.extraerJsonRespuesta(respuesta.data.response);

      // Validar campos obligatorios
      this.validarDatos(datosExtraidos);

      return {
        ...datosExtraidos,
        imagenHash,
      };
    } catch (error: any) {
      this.logger.error(
        `Error procesando factura: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error al procesar factura: ${error.message}`,
      );
    }
  }

  /**
   * Generar hash SHA-256 de imagen (para deteccion de duplicados)
   * @param imagenBase64 Imagen en base64
   * @returns Hash SHA-256
   */
  private generarHashImagen(imagenBase64: string): string {
    return crypto
      .createHash('sha256')
      .update(imagenBase64)
      .digest('hex');
  }

  /**
   * Leer prompt desde archivo
   * @returns Contenido del prompt
   */
  private leerPrompt(): string {
    try {
      return fs.readFileSync(this.promptPath, 'utf-8').trim();
    } catch (error: any) {
      this.logger.error(`Error leyendo prompt: ${error.message}`, error.stack);
      // Retornar prompt por defecto si no se puede leer archivo
      return `Extrae datos de factura en JSON: {comercio, fecha (YYYY-MM-DD), categoría, total}. Solo JSON.`;
    }
  }

  /**
   * Extraer JSON válido de respuesta de la IA
   * @param respuesta Texto de respuesta de la IA
   * @returns Objeto JSON parseado
   */
  private extraerJsonRespuesta(respuesta: string): any {
    try {
      // Limpiar respuesta de caracteres no JSON
      const respuestaLimpia = respuesta.trim();

      // Buscar JSON entre llaves
      const inicioJson = respuestaLimpia.indexOf('{');
      const finJson = respuestaLimpia.lastIndexOf('}');

      if (inicioJson === -1 || finJson === -1) {
        throw new Error('No se encontró JSON válido en respuesta');
      }

      const jsonStr = respuestaLimpia.substring(inicioJson, finJson + 1);
      return JSON.parse(jsonStr);
    } catch (error: any) {
      this.logger.error(
        `Error parseando JSON: ${error.message} | Respuesta: ${respuesta}`,
        error.stack,
      );
      throw new BadRequestException(
        'Error al procesar respuesta de IA. Intenta con otra imagen.',
      );
    }
  }

  /**
   * Validar que datos extraidos sean correctos
   * @param datos Datos a validar
   * @throws BadRequestException si datos son invalidos
   */
  private validarDatos(datos: any): void {
    // Validar campos obligatorios
    const camposObligatorios = ['comercio', 'fecha', 'categoria', 'total'];
    for (const campo of camposObligatorios) {
      if (!datos[campo]) {
        throw new BadRequestException(
          `Campo obligatorio faltante: ${campo}. Intenta con una imagen más clara.`,
        );
      }
    }

    // Validar formato fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) {
      throw new BadRequestException(
        `Formato de fecha inválido: ${datos.fecha}. Esperado: YYYY-MM-DD`,
      );
    }

    // Validar que total sea número positivo
    const total = parseFloat(datos.total);
    if (isNaN(total) || total <= 0) {
      throw new BadRequestException(
        `Total inválido: ${datos.total}. Debe ser número positivo.`,
      );
    }

    // Validar categoría conocida
    const categoriasValidas = [
      'Alimentación',
      'Transporte',
      'Servicios',
      'Salud',
      'Educación',
      'Entretenimiento',
      'Ropa',
      'Otros',
    ];
    if (!categoriasValidas.includes(datos.categoria)) {
      this.logger.warn(
        `Categoría desconocida: ${datos.categoria}. Usando "Otros"`,
      );
      datos.categoria = 'Otros';
    }

    // Convertir total a número
    datos.total = total;
  }

  /**
   * Validar si imagen ya fue procesada (detectar duplicados)
   * @param imagenHash Hash de imagen
   * @returns true si es nuevo, false si ya existe
   */
  async esImagenNueva(imagenHash: string): Promise<boolean> {
    // Esta logica se implementa en GastosService
    // cuando consulte base de datos
    return true;
  }
}