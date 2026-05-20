import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Matches,
  IsUUID,
  IsDateString,
} from 'class-validator';

export enum CategoriaGasto {
  ALIMENTACION = 'Alimentación',
  TRANSPORTE = 'Transporte',
  SERVICIOS = 'Servicios',
  HOGAR = 'Hogar',
  SALUD = 'Salud',
  ENTRETENIMIENTO = 'Entretenimiento',
  OTROS = 'Otros',
  ERROR = 'No Detectado',
}

/**
 * DTO para la respuesta después de procesar y guardar un recibo
 * Contiene toda la información del recibo en la BD
 */
export class ReciboProcesadoDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  comercio: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  fecha: string;

  @IsNumber()
  total: number;

  @IsEnum(CategoriaGasto)
  categoria: CategoriaGasto;

  @IsOptional()
  @IsString()
  estado?: string = 'Registrado';

  @IsOptional()
  @IsDateString()
  created_at?: Date;

  @IsOptional()
  @IsDateString()
  updated_at?: Date;
}

/**
 * DTO para respuesta de múltiples recibos procesados
 */
export class ProcesarMultiplesRespuestaDto {
  exitosos: ReciboProcesadoDto[];
  duplicados: Array<{
    index: number;
    razon: string;
    detalles?: any;
  }>;
  errores: Array<{
    index: number;
    error: string;
  }>;
  resumen: {
    total_procesados: number;
    total_exitosos: number;
    total_duplicados: number;
    total_errores: number;
  };
}
