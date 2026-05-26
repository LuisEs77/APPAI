import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

/**
 * DTO para creacion de nuevo usuario (Registro)
 * Valida que email y password cumplan requisitos de seguridad
 */
export class CrearUsuarioDto {
  @IsEmail({}, { message: 'El email debe ser valido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener minimo 8 caracteres' })
  password: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
