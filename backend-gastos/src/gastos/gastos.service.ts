import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IaService } from '../ia/ia.service';
import { Recibo } from './entities/recibo.entity';
import * as ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import FormData from 'form-data';
import axios from 'axios';

/**
 * Servicio de Gastos (Recibos)
 * Maneja logica de negocio para procesamiento de facturas
 * Integrado con IA, deteccion de duplicados y filtros por usuario
 */
@Injectable()
export class GastosService {
  private readonly logger = new Logger('GastosService');
  private readonly TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
  private readonly TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

  constructor(
    private readonly iaService: IaService,
    @InjectRepository(Recibo)
    private readonly reciboRepository: Repository<Recibo>,
  ) {}

  /**
   * Procesar una factura para usuario autenticado
   * @param usuarioId ID del usuario
   * @param imagenBase64 Imagen en formato base64
   * @returns Recibo procesado
   */
  async procesarFactura(usuarioId: string, imagenBase64: string): Promise<Recibo> {
    this.logger.log(`Procesando factura para usuario ${usuarioId}`);

    // 1. Procesar imagen con IA
    const resultadoIa = await this.iaService.procesarFactura(imagenBase64);

    // 2. Validar que no sea duplicado
    const reciboExistente = await this.reciboRepository.findOne({
      where: { imagen_hash: resultadoIa.imagenHash },
    });

    if (reciboExistente) {
      throw new ConflictException(
        'Esta factura ya fue procesada previamente. No se puede registrar duplicados.',
      );
    }

    // 3. Crear recibo vinculado al usuario
    const nuevoRecibo = this.reciboRepository.create({
      usuarioId,
      imagen_hash: resultadoIa.imagenHash,
      fecha: resultadoIa.fecha,
      comercio: resultadoIa.comercio,
      categoria: resultadoIa.categoria,
      total: resultadoIa.total,
      estado: 'Registrado',
    });

    // 4. Guardar en BD
    const reciboGuardado = await this.reciboRepository.save(nuevoRecibo);

    this.logger.log(
      `Factura procesada: ${reciboGuardado.comercio} Q${reciboGuardado.total}`,
    );

    return reciboGuardado;
  }

  /**
   * Procesar múltiples facturas a la vez
   * @param usuarioId ID del usuario
   * @param imagenes Array de imágenes en base64
   * @returns Resumen de procesamiento (exitosos, duplicados, errores)
   */
  async procesarMultiplesFacturas(
    usuarioId: string,
    imagenes: string[],
  ): Promise<any> {
    this.logger.log(`Procesando lote de ${imagenes.length} facturas para usuario ${usuarioId}`);

    const resultados = {
      exitosos: [] as Recibo[],
      duplicados: [] as { index: number; error: string }[],
      errores: [] as { index: number; error: string }[],
      resumen: {
        total_procesados: imagenes.length,
        total_exitosos: 0,
        total_duplicados: 0,
        total_errores: 0,
      },
    };

    // Procesar secuencialmente para evitar saturar la IA
    for (let i = 0; i < imagenes.length; i++) {
      try {
        const recibo = await this.procesarFactura(usuarioId, imagenes[i]);
        resultados.exitosos.push(recibo);
        resultados.resumen.total_exitosos++;
      } catch (error: any) {
        if (error instanceof ConflictException) {
          resultados.duplicados.push({ index: i, error: error.message });
          resultados.resumen.total_duplicados++;
        } else {
          this.logger.error(`Error procesando imagen ${i}: ${error.message}`);
          resultados.errores.push({ index: i, error: error.message });
          resultados.resumen.total_errores++;
        }
      }
      
      resultados.resumen.total_procesados = i + 1;
    }

    return resultados;
  }

  /**
   * Obtener todos los recibos del usuario autenticado
   * @param usuarioId ID del usuario
   * @param filtros Filtros opcionales (fecha, categoria)
   * @returns Lista de recibos
   */
  async obtenerRecibos(
    usuarioId: string,
    filtros?: {
      fechaInicio?: string;
      fechaFin?: string;
      categoria?: string;
    },
  ): Promise<Recibo[]> {
    const query = this.reciboRepository.createQueryBuilder('recibo');
    query.where('recibo.usuarioId = :usuarioId', { usuarioId });

    // Aplicar filtros
    if (filtros?.fechaInicio && filtros?.fechaFin) {
      this.logger.debug(`Filtrando por fecha: ${filtros.fechaInicio} hasta ${filtros.fechaFin}`);
      query.andWhere('recibo.fecha BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
      });
    }

    if (filtros?.categoria) {
      query.andWhere('recibo.categoria = :categoria', {
        categoria: filtros.categoria,
      });
    }

    query.orderBy('recibo.fecha', 'DESC');

    const resultados = await query.getMany();
    this.logger.debug(`Recibos encontrados para usuario ${usuarioId}: ${resultados.length}`);
    return resultados;
  }

  /**
   * Obtener un recibo especifico del usuario
   * @param usuarioId ID del usuario
   * @param reciboId ID del recibo
   * @returns Recibo
   */
  async obtenerRecibo(usuarioId: string, reciboId: string): Promise<Recibo> {
    const recibo = await this.reciboRepository.findOne({
      where: {
        id: reciboId,
        usuarioId,
      },
    });

    if (!recibo) {
      throw new NotFoundException(
        'Recibo no encontrado o no tienes permisos para acceder',
      );
    }

    return recibo;
  }

  /**
   * Obtener estadisticas de gastos del usuario
   * @param usuarioId ID del usuario
   * @param mes Mes (1-12)
   * @param anio Anio (YYYY)
   * @returns Estadisticas agregadas
   */
  async obtenerEstadisticas(
    usuarioId: string,
    mes: number,
    anio: number,
  ): Promise<any> {
    // Construir fechas del mes de forma robusta
    const mesPad = String(mes).padStart(2, '0');
    const fechaInicio = `${anio}-${mesPad}-01`;
    const ultimoDia = new Date(anio, mes, 0).getDate();
    const fechaFinStr = `${anio}-${mesPad}-${String(ultimoDia).padStart(2, '0')}`;

    const recibos = await this.obtenerRecibos(usuarioId, {
      fechaInicio,
      fechaFin: fechaFinStr,
    });

    // Calcular estadisticas
    const totalGastado = recibos.reduce((sum, r) => sum + Number(r.total), 0);
    const cantidadTransacciones = recibos.length;

    // Agrupar por categoria
    const porCategoria = {};
    recibos.forEach((recibo) => {
      if (!porCategoria[recibo.categoria]) {
        porCategoria[recibo.categoria] = {
          cantidad: 0,
          total: 0,
        };
      }
      porCategoria[recibo.categoria].cantidad++;
      porCategoria[recibo.categoria].total += Number(recibo.total);
    });

    return {
      periodo: `${anio}-${String(mes).padStart(2, '0')}`,
      totalGastado: parseFloat(totalGastado.toFixed(2)),
      cantidadTransacciones,
      promedioPorTransaccion: parseFloat(
        (totalGastado / cantidadTransacciones || 0).toFixed(2),
      ),
      porCategoria,
    };
  }

  /**
   * Eliminar recibo del usuario
   * @param usuarioId ID del usuario
   * @param reciboId ID del recibo a eliminar
   */
  async eliminarRecibo(usuarioId: string, reciboId: string): Promise<void> {
    const recibo = await this.obtenerRecibo(usuarioId, reciboId);

    await this.reciboRepository.remove(recibo);

    this.logger.log(`Recibo ${reciboId} eliminado`);
  }

  /**
   * Generar reporte Excel para usuario
   * @param usuarioId ID del usuario
   * @param mes Mes del reporte
   * @param anio Anio del reporte
   * @returns Buffer con archivo Excel
   */
  async generarReporteExcel(
    usuarioId: string,
    mes: number,
    anio: number,
  ): Promise<Buffer> {
    this.logger.log(
      `Generando reporte Excel para usuario ${usuarioId} (${anio}-${mes})`,
    );

    // Obtener recibos del periodo de forma robusta
    const mesPad = String(mes).padStart(2, '0');
    const fechaInicio = `${anio}-${mesPad}-01`;
    const ultimoDia = new Date(anio, mes, 0).getDate();
    const fechaFinStr = `${anio}-${mesPad}-${String(ultimoDia).padStart(2, '0')}`;

    const recibos = await this.obtenerRecibos(usuarioId, {
      fechaInicio,
      fechaFin: fechaFinStr,
    });

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial de Gastos');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Comercio', key: 'comercio', width: 25 },
      { header: 'Categoria', key: 'categoria', width: 15 },
      { header: 'Total (Q)', key: 'total', width: 12 },
      { header: 'Estado', key: 'estado', width: 12 },
    ];

    // Agregar estilos al encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '003366' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Agregar datos
    let totalGastado = 0;
    recibos.forEach((recibo) => {
      worksheet.addRow({
        fecha: recibo.fecha,
        comercio: recibo.comercio,
        categoria: recibo.categoria,
        total: Number(recibo.total),
        estado: recibo.estado,
      });
      totalGastado += Number(recibo.total);
    });

    // Agregar fila de totales
    const filaTotal = worksheet.addRow({
      fecha: 'TOTAL:',
      total: totalGastado,
    });
    filaTotal.font = { bold: true };
    filaTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEEEEE' } };

    // Convertir a buffer
    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  /**
   * Generar reporte PDF para usuario
   * @param usuarioId ID del usuario
   * @param mes Mes del reporte
   * @param anio Anio del reporte
   * @param nombreUsuario Nombre para el encabezado
   * @returns Buffer con archivo PDF
   */
  async generarReportePDF(
    usuarioId: string,
    mes: number,
    anio: number,
    nombreUsuario: string,
  ): Promise<Buffer> {
    this.logger.log(`Generando reporte PDF para usuario ${usuarioId} (${anio}-${mes})`);

    // Obtener recibos del periodo de forma robusta
    const mesPad = String(mes).padStart(2, '0');
    const fechaInicio = `${anio}-${mesPad}-01`;
    const ultimoDia = new Date(anio, mes, 0).getDate();
    const fechaFinStr = `${anio}-${mesPad}-${String(ultimoDia).padStart(2, '0')}`;

    const recibos = await this.obtenerRecibos(usuarioId, {
      fechaInicio,
      fechaFin: fechaFinStr,
    });

    const doc = new jsPDF();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mesNombre = meses[mes - 1];

    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text('Reporte Mensual de Gastos', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Usuario: ${nombreUsuario}`, 20, 35);
    doc.text(`Periodo: ${mesNombre} ${anio}`, 20, 42);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 49);

    // Tabla de datos
    const filas = recibos.map(r => [
      r.fecha,
      r.comercio,
      r.categoria,
      `Q${Number(r.total).toFixed(2)}`
    ]);

    const totalGastado = recibos.reduce((sum, r) => sum + Number(r.total), 0);
    filas.push(['', '', 'TOTAL', `Q${totalGastado.toFixed(2)}`]);

    (doc as any).autoTable({
      startY: 60,
      head: [['Fecha', 'Comercio', 'Categoría', 'Monto']],
      body: filas,
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      footStyles: { fillColor: [230, 242, 255], textColor: [0, 51, 102], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Obtiene todos los recibos registrados (para reportes y análisis)
   */
  async obtenerTodosRecibos(): Promise<Recibo[]> {
    return await this.reciboRepository.find({
      order: {
        created_at: 'DESC',
      } as any,
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
      { header: 'Categoria', key: 'categoria', width: 20 },
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
      `Reporte financiero automatizado generado por el sistema.\n` +
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
      this.logger.log('Archivo enviado exitosamente a Telegram.');
      return {
        success: true,
        message: 'Reporte generado y enviado con exito.',
        total_recibos: recibos.length,
      };
    } catch (error) {
      this.logger.error('Error en la transmision hacia Telegram', error.message);
      throw new Error('Fallo en el servicio de integracion con Telegram.');
    }
  }
}