import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ReportesService } from './reportes.service';

/**
 * Controlador público de reportes (solo para pruebas)
 * No requiere autenticación y expone un endpoint para enviar un correo de prueba.
 */
@Controller('reportes')
export class ReportesPublicController {
  constructor(private readonly reportesService: ReportesService) {}

  @Post('enviar-prueba-public')
  @HttpCode(HttpStatus.OK)
  async enviarCorreoPruebaPublic(@Body('email') email: string | undefined) {
    try {
      const emailDestino = email || '';
      if (!emailDestino) {
        throw new Error('Debe proporcionar el email en el body { "email": "tu@correo" }');
      }

      await this.reportesService.enviarCorreoPrueba(emailDestino, 'Usuario');

      return { mensaje: `Correo de prueba enviado a ${emailDestino}`, enviado: true };
    } catch (error: any) {
      throw new BadRequestException(`Error al enviar correo de prueba: ${error?.message || error}`);
    }
  }
}
