import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { IaService, ResultadoFactura } from './ia.service';
import { JwtGuard } from '../guards/jwt.guard';

/**
 * Controlador de IA
 * Maneja endpoints para procesamiento de facturas con IA
 */
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  /**
   * POST /ia/procesar-factura - Procesar imagen de factura (requiere autenticacion)
   * @param cuerpo Objeto con imagenBase64
   * @param request Request con usuario autenticado
   * @returns Datos extraidos de la factura
   */
  @Post('procesar-factura')
  @UseGuards(JwtGuard)
  async procesarFactura(
    @Body() cuerpo: { imagenBase64: string },
    @Request() request: any,
  ): Promise<ResultadoFactura> {
    if (!cuerpo.imagenBase64) {
      throw new BadRequestException(
        'Debe proporcionar imagenBase64 en el cuerpo',
      );
    }

    // Validar que sea base64 valido
    try {
      Buffer.from(cuerpo.imagenBase64, 'base64');
    } catch (error) {
      throw new BadRequestException(
        'imagenBase64 no es valido. Debe estar en formato base64.',
      );
    }

    return await this.iaService.procesarFactura(cuerpo.imagenBase64);
  }
}
