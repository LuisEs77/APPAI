import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtGuard } from '../guards/jwt.guard';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EnviarReporteDto } from './dto/enviar-reporte.dto';

/**
 * Controlador de Reportes
 * Maneja endpoints para generacion y envio de reportes
 */
@Controller('reportes')
@UseGuards(JwtGuard)
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
    private readonly usuariosService: UsuariosService,
  ) {}

  /**
   * POST /reportes/enviar-mensual/:mes/:anio - Generar y enviar reporte por correo
   * @param mes Mes del reporte (1-12)
   * @param anio Anio del reporte (YYYY)
   * @param body Datos del reporte (email opcional)
   * @param request Request con usuario autenticado
   */
  @Post('enviar-mensual/:mes/:anio')
  @HttpCode(HttpStatus.OK)
  async enviarReporteMensual(
    @Param('mes') mes: string,
    @Param('anio') anio: string,
    @Body() enviarReporteDto: EnviarReporteDto,
    @Request() request: any,
  ): Promise<{ mensaje: string; enviado: boolean }> {
    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10);

    // Validar parametros
    if (mesNum < 1 || mesNum > 12 || isNaN(anioNum)) {
      throw new BadRequestException(
        'Parametros invalidos. Mes debe ser 1-12, Anio debe ser numero valido',
      );
    }

    try {
      // Obtener datos del usuario para envio de email
      const usuario = await this.usuariosService.obtenerPorId(request.user.id);
      
      // Usar el email del DTO si se proporciona, sino usar el del usuario
      const emailDestino = enviarReporteDto.email || usuario.email;

      // Enviar reporte por correo
      await this.reportesService.enviarReporteMensual(
        emailDestino,
        usuario.nombre,
        mesNum,
        anioNum,
        request.user.id,
      );

      return {
        mensaje: `Reporte enviado exitosamente a ${emailDestino}`,
        enviado: true,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al enviar reporte: ${error.message}`,
      );
    }
  }

  /**
   * POST /reportes/enviar-prueba - Enviar un correo de prueba al usuario autenticado o al email provisto en body
   */
  @Post('enviar-prueba')
  @HttpCode(HttpStatus.OK)
  async enviarCorreoPrueba(
    @Body() enviarReporteDto: EnviarReporteDto,
    @Request() request: any,
  ): Promise<{ mensaje: string; enviado: boolean }> {
    try {
      console.log(`[REPORTES] POST /api/reportes/enviar-prueba called by user=${request?.user?.id} bodyEmail=${enviarReporteDto.email}`);
      const usuario = await this.usuariosService.obtenerPorId(request.user.id);
      const emailDestino = enviarReporteDto.email || usuario.email;
      console.log(`[REPORTES] Will send test email to ${emailDestino}`);

      await this.reportesService.enviarCorreoPrueba(emailDestino, usuario.nombre || '');

      return {
        mensaje: `Correo de prueba enviado a ${emailDestino}`,
        enviado: true,
      };
    } catch (error) {
      throw new BadRequestException(`Error al enviar correo de prueba: ${error.message}`);
    }
  }
}
