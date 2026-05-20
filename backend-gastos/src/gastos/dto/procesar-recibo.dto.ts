import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';

/**
 * DTO para procesar un único recibo (mantener compatibilidad)
 */
export class ProcesarReciboDto {
  @IsString()
  @IsNotEmpty({ message: 'La imagen en base64 no puede estar vacía.' })
  image: string;
}

/**
 * DTO para procesar múltiples recibos
 * Nuevo endpoint: POST /gastos/procesar-multiples
 */
export class ProcesarMultiplesRecibosDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debes proporcionar al menos una imagen.' })
  @IsString({ each: true })
  @IsNotEmpty({
    each: true,
    message: 'Ninguna imagen puede estar vacía.',
  })
  images: string[];
}
