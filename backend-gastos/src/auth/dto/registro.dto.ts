import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO para registro de nuevo usuario
 * Extiende credenciales basicas con informacion personal
 */
export class RegistroDto {
  @IsEmail({}, { message: 'El email debe ser valido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener minimo 8 caracteres' })
  password: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;
}
