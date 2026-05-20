import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { GastosService } from './gastos.service';
import {
  ProcesarReciboDto,
  ProcesarMultiplesRecibosDto,
} from './dto/procesar-recibo.dto';
import { ReciboProcesadoDto, ProcesarMultiplesRespuestaDto } from './dto/recibo-procesado.dto';

@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  /**
   * Ruta: POST /gastos/procesar
   * Procesa un único recibo (mantiene compatibilidad con Fase 1)
   * 
   * @body image - Imagen en Base64
   * @returns ReciboProcesadoDto
   */
  @Post('procesar')
  @HttpCode(HttpStatus.OK)
  async procesar(@Body() body: ProcesarReciboDto): Promise<ReciboProcesadoDto> {
    if (!body.image) {
      throw new Error('No se proporcionó ninguna imagen en la petición.');
    }

    return await this.gastosService.procesarRecibo(body.image);
  }

  /**
   * Ruta: POST /gastos/procesar-multiples
   * NEW: Procesa múltiples recibos de una sola vez
   * 
   * Devuelve un resumen detallado con:
   * - Recibos procesados exitosamente
   * - Recibos duplicados rechazados (409 Conflict)
   * - Errores en validación de IA
   * 
   * @body images - Array de imágenes en Base64
   * @returns ProcesarMultiplesRespuestaDto
   */
  @Post('procesar-multiples')
  @HttpCode(HttpStatus.OK)
  async procesarMultiples(
    @Body() body: ProcesarMultiplesRecibosDto,
  ): Promise<ProcesarMultiplesRespuestaDto> {
    if (!body.images || body.images.length === 0) {
      throw new Error('Debes proporcionar al menos una imagen.');
    }

    return await this.gastosService.procesarMultiplesRecibos(body.images);
  }

  /**
   * Ruta: GET /gastos/historial
   * Obtiene todos los recibos registrados
   */
  @Get('historial')
  @HttpCode(HttpStatus.OK)
  async obtenerHistorial() {
    return await this.gastosService.obtenerTodosRecibos();
  }

  /**
   * Ruta: POST /gastos/reporte
   * Ejecuta la generación del archivo Excel y su envío a través de Telegram.
   */
  @Post('reporte')
  @HttpCode(HttpStatus.OK)
  async enviarReporte() {
    return await this.gastosService.generarYEnviarExcel();
  }
}