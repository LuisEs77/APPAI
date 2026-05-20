import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IaService } from '../ia/ia.service';
import { DuplicidadService } from './services/duplicidad.service';
import { ReciboProcesadoDto, ProcesarMultiplesRespuestaDto } from './dto/recibo-procesado.dto';
import { Recibo } from './entities/recibo.entity';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as ExcelJS from 'exceljs';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class GastosService {
  private readonly logger = new Logger(GastosService.name);

  // Configuración de Telegram (Debe reemplazar estos valores con los de su Bot)
  private readonly TELEGRAM_BOT_TOKEN = 'TU_TOKEN_DE_BOT_AQUI';
  private readonly TELEGRAM_CHAT_ID = 'TU_CHAT_ID_AQUI';

  constructor(
    private readonly iaService: IaService,
    private readonly duplicidadService: DuplicidadService,
    @InjectRepository(Recibo)
    private readonly reciboRepository: Repository<Recibo>,
  ) {}

  /**
   * Procesa un único recibo (mantiene compatibilidad con Fase 1)
   * @param imageBase64 - Imagen en Base64
   * @returns Recibo procesado y guardado en BD
   */
  async procesarRecibo(imageBase64: string): Promise<ReciboProcesadoDto> {
    // 1. Validar anti-duplicidad
    const imagenHash = await this.duplicidadService.validarDuplicidad(imageBase64);

    // 2. Enviar la imagen a la IA Local
    const iaResult = await this.iaService.analizarImagen(imageBase64);

    // 3. Validación de Salida
    this.logger.log('Validando la respuesta de la IA contra las reglas del sistema...');

    const reciboValidado = plainToInstance(ReciboProcesadoDto, iaResult);
    const errores = await validate(reciboValidado);

    if (errores.length > 0) {
      this.logger.error('La IA devolvió un formato incorrecto o incompleto', JSON.stringify(errores));
      throw new BadRequestException(
        'Los datos extraídos están incompletos. Intenta tomar la foto con mejor iluminación.',
      );
    }

    // 4. Guardar en la base de datos
    const recibo = this.reciboRepository.create({
      imagen_hash: imagenHash,
      fecha: reciboValidado.fecha,
      comercio: reciboValidado.comercio,
      categoria: reciboValidado.categoria,
      total: reciboValidado.total,
      estado: 'Registrado',
    });

    const reciboGuardado = await this.reciboRepository.save(recibo);

    this.logger.log(
      `✅ Éxito. Gasto registrado en BD: Q${reciboGuardado.total} en ${reciboGuardado.comercio}.`,
    );

    // 5. Convertir entidad a DTO para respuesta
    return plainToInstance(ReciboProcesadoDto, reciboGuardado);
  }

  /**
   * Procesa múltiples recibos de forma segura
   * Valida anti-duplicidad para cada uno y devuelve un resumen detallado
   *
   * @param images - Array de imágenes en Base64
   * @returns Resumen con exitosos, duplicados y errores
   */
  async procesarMultiplesRecibos(
    images: string[],
  ): Promise<ProcesarMultiplesRespuestaDto> {
    this.logger.log(`🔄 Iniciando procesamiento de ${images.length} imágenes...`);

    const respuesta: ProcesarMultiplesRespuestaDto = {
      exitosos: [],
      duplicados: [],
      errores: [],
      resumen: {
        total_procesados: images.length,
        total_exitosos: 0,
        total_duplicados: 0,
        total_errores: 0,
      },
    };

    // Procesar cada imagen
    for (let index = 0; index < images.length; index++) {
      const imageBase64 = images[index];

      try {
        // Validar anti-duplicidad
        let imagenHash: string;
        try {
          imagenHash = await this.duplicidadService.validarDuplicidad(imageBase64);
        } catch (conflictError) {
          if (conflictError instanceof ConflictException) {
            this.logger.warn(`⚠️ Imagen ${index + 1}: Duplicada`);
            respuesta.duplicados.push({
              index,
              razon: 'El recibo ya existe en la base de datos',
              detalles: conflictError.getResponse(),
            });
            respuesta.resumen.total_duplicados++;
            continue;
          }
          throw conflictError;
        }

        // Enviar a IA
        const iaResult = await this.iaService.analizarImagen(imageBase64);

        // Validar DTO
        const reciboValidado = plainToInstance(ReciboProcesadoDto, iaResult);
        const errores = await validate(reciboValidado);

        if (errores.length > 0) {
          this.logger.error(
            `❌ Imagen ${index + 1}: Validación fallida`,
            JSON.stringify(errores),
          );
          respuesta.errores.push({
            index,
            error: 'Los datos extraídos están incompletos o mal formateados',
          });
          respuesta.resumen.total_errores++;
          continue;
        }

        // Guardar en BD
        const recibo = this.reciboRepository.create({
          imagen_hash: imagenHash,
          fecha: reciboValidado.fecha,
          comercio: reciboValidado.comercio,
          categoria: reciboValidado.categoria,
          total: reciboValidado.total,
          estado: 'Registrado',
        });

        const reciboGuardado = await this.reciboRepository.save(recibo);
        respuesta.exitosos.push(plainToInstance(ReciboProcesadoDto, reciboGuardado));
        respuesta.resumen.total_exitosos++;

        this.logger.log(
          `✅ Imagen ${index + 1}: Registrada (${reciboGuardado.comercio} - Q${reciboGuardado.total})`,
        );
      } catch (error) {
        this.logger.error(`❌ Imagen ${index + 1}: Error inesperado`, error.message);
        respuesta.errores.push({
          index,
          error: error.message || 'Error desconocido',
        });
        respuesta.resumen.total_errores++;
      }
    }

    this.logger.log(
      `📊 Resumen: ${respuesta.resumen.total_exitosos} exitosos, ` +
        `${respuesta.resumen.total_duplicados} duplicados, ` +
        `${respuesta.resumen.total_errores} errores`,
    );

    return respuesta;
  }

  /**
   * Obtiene todos los recibos registrados (para reportes y análisis)
   */
  async obtenerTodosRecibos(): Promise<Recibo[]> {
    return await this.reciboRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Genera reporte de Excel con todos los recibos y lo envía por Telegram
   */
  async generarYEnviarExcel() {
    this.logger.log('Creando reporte de Excel...');

    // 1. Obtener todos los recibos de la BD
    const recibos = await this.obtenerTodosRecibos();

    if (recibos.length === 0) {
      this.logger.warn('No hay recibos para generar el reporte');
      return {
        success: false,
        message: 'No hay datos para generar el reporte',
      };
    }

    // 2. Crear el archivo Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial de Gastos');

    // Estructurar la cabecera del documento
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Comercio', key: 'comercio', width: 25 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Total (Q)', key: 'total', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Registrado', key: 'created_at', width: 20 },
    ];

    // Agregar datos de la BD
    recibos.forEach((recibo) => {
      worksheet.addRow({
        fecha: recibo.fecha,
        comercio: recibo.comercio,
        categoria: recibo.categoria,
        total: recibo.total,
        estado: recibo.estado,
        created_at: recibo.created_at,
      });
    });

    // Agregar fila de totales
    const totalRow = worksheet.addRow({
      fecha: 'TOTAL:',
      total: recibos.reduce((sum, r) => sum + Number(r.total), 0),
    });
    totalRow.font = { bold: true };

    // 3. Convertir a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 4. Preparar y enviar por Telegram
    const formData = new FormData();
    formData.append('chat_id', this.TELEGRAM_CHAT_ID);
    formData.append('document', Buffer.from(buffer as ArrayBuffer), {
      filename: `Reporte_Gastos_${new Date().getTime()}.xlsx`,
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    formData.append(
      'caption',
      `📊 Reporte financiero automatizado generado por el sistema.\n` +
        `Total de recibos: ${recibos.length}\n` +
        `Total gastado: Q${recibos.reduce((sum, r) => sum + Number(r.total), 0).toFixed(2)}`,
    );

    this.logger.log('Enviando documento a Telegram...');
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.TELEGRAM_BOT_TOKEN}/sendDocument`,
        formData,
        { headers: formData.getHeaders() },
      );
      this.logger.log('✅ Archivo enviado exitosamente a Telegram.');
      return {
        success: true,
        message: 'Reporte generado y enviado con éxito.',
        total_recibos: recibos.length,
      };
    } catch (error) {
      this.logger.error('❌ Error en la transmisión hacia Telegram', error.message);
      throw new Error('Fallo en el servicio de integración con Telegram.');
    }
  }
}