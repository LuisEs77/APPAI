import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { TokenDto } from './dto/token.dto';
import { JwtGuard } from '../guards/jwt.guard';

/**
 * Controlador de Autenticacion
 * Maneja endpoints de login, registro y cambio de password
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login - Iniciar sesion
   * @param loginDto Email y password
   * @returns JWT y datos del usuario
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<TokenDto> {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * POST /auth/registro - Registrar nuevo usuario
   * @param registroDto Email, password y datos personales
   * @returns JWT y datos del usuario
   */
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async registrarse(@Body() registroDto: RegistroDto): Promise<TokenDto> {
    try {
      return await this.authService.registrarse(registroDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * POST /auth/cambiar-password - Cambiar contraseña (requiere autenticacion)
   * @param cambioPasswordDto Contraseña actual y nueva
   * @param request Request con usuario autenticado
   */
  @Post('cambiar-password')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async cambiarPassword(
    @Body()
    cambioPasswordDto: {
      passwordActual: string;
      passwordNueva: string;
    },
    @Request() request: any,
  ) {
    try {
      await this.authService.cambiarPassword(
        request.user.id,
        cambioPasswordDto.passwordActual,
        cambioPasswordDto.passwordNueva,
      );

      return {
        message: 'Contraseña actualizada correctamente',
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * POST /auth/verificar - Verificar que token sea valido (requiere autenticacion)
   * @param request Request con usuario autenticado
   * @returns Datos del usuario autenticado
   */
  @Post('verificar')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async verificar(@Request() request: any) {
    return {
      success: true,
      usuario: request.user,
    };
  }
}
