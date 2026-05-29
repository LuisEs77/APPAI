import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EnviarReporteDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email proporcionado no es válido' })
  email?: string;
}
