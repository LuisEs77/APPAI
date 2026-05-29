import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO para inicio de sesion
 * Valida credenciales del usuario
 */
export class LoginDto {
  @IsEmail({}, { message: 'El email debe ser valido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener minimo 8 caracteres' })
  password!: string;
}
