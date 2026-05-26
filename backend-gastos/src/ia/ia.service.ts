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
 * Integra Ollama para extraer datos de facturas
 * Prompt ultra-conciso para optimizacion de tokens
 */
@Injectable()
export class IaService {
  private readonly logger = new Logger('IaService');
  private readonly ollamaUrl =
    process.env.OLLAMA_API_URL || 'http://localhost:11434';
  private readonly ollamaModel =
    process.env.OLLAMA_MODEL || 'neural-chat';
  private readonly promptPath = path.join(
    __dirname,
    'prompts',
    'extractor-factura-v2.txt',
  );

  constructor(private readonly httpService: HttpService) {}

  /**
   * Procesar imagen de factura con Ollama
   * @param imagenBase64 Imagen en formato base64
   * @returns Datos extraidos de la factura
   */
  async procesarFactura(imagenBase64: string): Promise<ResultadoFactura> {
    try {
      // Generar hash de imagen para evitar duplicados
      const imagenHash = this.generarHashImagen(imagenBase64);

      // Leer prompt optimizado
      const prompt = this.leerPrompt();

      // Hacer request a Ollama
      this.logger.log(`Enviando imagen a Ollama (modelo: ${this.ollamaModel})`);
      const respuesta = await this.httpService.axiosRef.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.ollamaModel,
          prompt: prompt,
          images: [imagenBase64],
          stream: false,
          // Parametros optimizados para velocidad
          num_predict: 200, // Limitado a tokens minimos
          temperature: 0.1, // Bajo para respuestas consistentes
          top_k: 10,
          top_p: 0.5,
        },
      );

      // Parsear respuesta JSON de Ollama
      const datosExtraidos = this.extraerJsonRespuesta(respuesta.data.response);

      // Validar campos obligatorios
      this.validarDatos(datosExtraidos);

      return {
        ...datosExtraidos,
        imagenHash,
      };
    } catch (error) {
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
    } catch (error) {
      this.logger.error(`Error leyendo prompt: ${error.message}`);
      // Retornar prompt por defecto si no se puede leer archivo
      return `Extrae datos de factura en JSON: {comercio, fecha (YYYY-MM-DD), categoria, total}. Solo JSON.`;
    }
  }

  /**
   * Extraer JSON valido de respuesta de Ollama
   * @param respuesta Texto de respuesta de Ollama
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
        throw new Error('No se encontro JSON valido en respuesta');
      }

      const jsonStr = respuestaLimpia.substring(inicioJson, finJson + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      this.logger.error(
        `Error parseando JSON: ${error.message} | Respuesta: ${respuesta}`,
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
          `Campo obligatorio faltante: ${campo}. Intenta con una imagen mas clara.`,
        );
      }
    }

    // Validar formato fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) {
      throw new BadRequestException(
        `Formato de fecha invalido: ${datos.fecha}. Esperado: YYYY-MM-DD`,
      );
    }

    // Validar que total sea numero positivo
    const total = parseFloat(datos.total);
    if (isNaN(total) || total <= 0) {
      throw new BadRequestException(
        `Total invalido: ${datos.total}. Debe ser numero positivo.`,
      );
    }

    // Validar categoria conocida
    const categoriasValidas = [
      'Alimentacion',
      'Transporte',
      'Servicios',
      'Salud',
      'Educacion',
      'Entretenimiento',
      'Ropa',
      'Otros',
    ];
    if (!categoriasValidas.includes(datos.categoria)) {
      this.logger.warn(
        `Categoria desconocida: ${datos.categoria}. Usando "Otros"`,
      );
      datos.categoria = 'Otros';
    }

    // Convertir total a numero
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