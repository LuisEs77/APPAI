import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { GastosService } from './gastos.service';
import { JwtGuard } from '../guards/jwt.guard';
import { Recibo } from './entities/recibo.entity';

/**
 * Controlador de Gastos (Recibos)
 * Maneja endpoints para procesamiento y consulta de facturas
 * Todos requieren autenticacion JWT
 */
@Controller('gastos')
@UseGuards(JwtGuard)
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  /**
   * POST /gastos/procesar - Procesar una factura
   * @param cuerpo Objeto con imagenBase64
   * @param request Request con usuario autenticado
   * @returns Recibo procesado
   */
  @Post('procesar')
  @HttpCode(HttpStatus.CREATED)
  async procesar(
    @Body() cuerpo: { imagenBase64: string },
    @Request() request: any,
  ): Promise<Recibo> {
    if (!cuerpo.imagenBase64) {
      throw new BadRequestException(
        'Debe proporcionar imagenBase64 en el cuerpo',
      );
    }

    return await this.gastosService.procesarFactura(
      request.user.id,
      cuerpo.imagenBase64,
    );
  }

  /**
   * GET /gastos - Obtener recibos del usuario (con filtros opcionales)
   * @param request Request con usuario autenticado
   * @param fechaInicio Fecha inicio (YYYY-MM-DD)
   * @param fechaFin Fecha fin (YYYY-MM-DD)
   * @param categoria Categoria del gasto
   * @returns Lista de recibos
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async obtenerRecibos(
    @Request() request: any,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('categoria') categoria?: string,
  ): Promise<Recibo[]> {
    return await this.gastosService.obtenerRecibos(request.user.id, {
      fechaInicio,
      fechaFin,
      categoria,
    });
  }

  /**
   * GET /gastos/:id - Obtener un recibo especifico
   * @param id ID del recibo
   * @param request Request con usuario autenticado
   * @returns Recibo
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtenerRecibo(
    @Param('id') id: string,
    @Request() request: any,
  ): Promise<Recibo> {
    return await this.gastosService.obtenerRecibo(request.user.id, id);
  }

  /**
   * GET /gastos/estadisticas/:mes/:anio - Obtener estadisticas de gastos
   * @param mes Mes (1-12)
   * @param anio Anio (YYYY)
   * @param request Request con usuario autenticado
   * @returns Estadisticas aggregadas
   */
  @Get('estadisticas/:mes/:anio')
  @HttpCode(HttpStatus.OK)
  async obtenerEstadisticas(
    @Param('mes') mes: string,
    @Param('anio') anio: string,
    @Request() request: any,
  ): Promise<any> {
    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10);

    if (mesNum < 1 || mesNum > 12 || isNaN(anioNum)) {
      throw new BadRequestException(
        'Parametros invalidos. Mes debe ser 1-12, Anio debe ser numero valido',
      );
    }

    return await this.gastosService.obtenerEstadisticas(
      request.user.id,
      mesNum,
      anioNum,
    );
  }

  /**
   * DELETE /gastos/:id - Eliminar un recibo
   * @param id ID del recibo
   * @param request Request con usuario autenticado
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarRecibo(
    @Param('id') id: string,
    @Request() request: any,
  ): Promise<void> {
    await this.gastosService.eliminarRecibo(request.user.id, id);
  }

  /**
   * GET /gastos/reporte/:mes/:anio - Generar reporte Excel
   * @param mes Mes del reporte
   * @param anio Anio del reporte
   * @param request Request con usuario autenticado
   * @returns Buffer del archivo Excel
   */
  @Get('reporte/:mes/:anio')
  @HttpCode(HttpStatus.OK)
  async generarReporte(
    @Param('mes') mes: string,
    @Param('anio') anio: string,
    @Request() request: any,
  ): Promise<Buffer> {
    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10);

    if (mesNum < 1 || mesNum > 12 || isNaN(anioNum)) {
      throw new BadRequestException(
        'Parametros invalidos. Mes debe ser 1-12, Anio debe ser numero valido',
      );
    }

    return await this.gastosService.generarReporteExcel(
      request.user.id,
      mesNum,
      anioNum,
    );
  }
}