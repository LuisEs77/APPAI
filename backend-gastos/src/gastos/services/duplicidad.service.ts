import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Recibo } from '../entities/recibo.entity';

/**
 * Servicio especializado en validación y prevención de duplicidad de recibos
 * Estrategia: Hash SHA-256 de la imagen en Base64
 *
 * Por qué este método:
 * - Eficiente: O(1) búsqueda por hash
 * - Seguro: Imposible falsificar dos imágenes iguales con hashes distintos
 * - Flexible: Permite identificar recibos duplicados incluso con ligeras variaciones
 */
@Injectable()
export class DuplicidadService {
  private readonly logger = new Logger(DuplicidadService.name);

  constructor(
    @InjectRepository(Recibo)
    private reciboRepository: Repository<Recibo>,
  ) {}

  /**
   * Genera un hash SHA-256 a partir de una imagen en Base64
   * @param imageBase64 - Imagen codificada en Base64
   * @returns Hash SHA-256 de 64 caracteres
   */
  generarHashImagen(imageBase64: string): string {
    return crypto
      .createHash('sha256')
      .update(imageBase64, 'utf8')
      .digest('hex');
  }

  /**
   * Valida si un recibo ya existe en la base de datos
   * Lanza excepción 409 Conflict si el recibo es duplicado
   *
   * @param imageBase64 - Imagen en Base64
   * @returns Hash de la imagen (para usar en el guardado)
   * @throws ConflictException - Si el recibo ya existe
   */
  async validarDuplicidad(imageBase64: string): Promise<string> {
    const hash = this.generarHashImagen(imageBase64);

    // Buscar si existe un recibo con este hash
    const reciboExistente = await this.reciboRepository.findOne({
      where: { imagen_hash: hash },
    });

    if (reciboExistente) {
      this.logger.warn(
        `⚠️ Intento de registrar recibo duplicado: ${hash}. ` +
          `Comercio: ${reciboExistente.comercio}, Fecha: ${reciboExistente.fecha}`,
      );

      throw new ConflictException({
        statusCode: 409,
        message: 'Este recibo ya ha sido registrado anteriormente.',
        error: 'Conflict',
        detalles: {
          comercio: reciboExistente.comercio,
          fecha: reciboExistente.fecha,
          total: reciboExistente.total,
          creado_en: reciboExistente.created_at,
        },
      });
    }

    this.logger.log(`✅ Validación anti-duplicidad aprobada para hash: ${hash}`);
    return hash;
  }

  /**
   * Método alternativo: Validación secundaria mediante combinación
   * comercio + fecha + total (útil para casos donde la imagen tenga ligeros cambios)
   *
   * @param comercio - Nombre del comercio
   * @param fecha - Fecha de la compra
   * @param total - Monto total
   * @returns true si el recibo es potencialmente duplicado
   */
  async validarDuplicidadSecundaria(
    comercio: string,
    fecha: string,
    total: number,
  ): Promise<boolean> {
    const reciboExistente = await this.reciboRepository.findOne({
      where: {
        comercio,
        fecha,
        total,
      },
    });

    return !!reciboExistente;
  }
}
