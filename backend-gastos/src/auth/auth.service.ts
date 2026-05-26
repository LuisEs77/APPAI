import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { TokenDto } from './dto/token.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';

/**
 * Servicio de Autenticacion
 * Maneja login, registro y emision de JWT
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validar credenciales e iniciar sesion
   * @param loginDto Email y password
   * @returns JWT y datos del usuario
   */
  async login(loginDto: LoginDto): Promise<TokenDto> {
    // Obtener usuario por email
    const usuario = await this.usuariosService.obtenerPorEmail(
      loginDto.email,
    );

    // Validar password
    const passwordValido = await this.usuariosService.validarPassword(
      loginDto.password,
      usuario.password,
    );

    if (!passwordValido) {
      throw new UnauthorizedException(
        'Credenciales invalidas. Email o password incorrecto',
      );
    }

    // Verificar que usuario este activo
    if (!usuario.activo) {
      throw new UnauthorizedException(
        'El usuario ha sido desactivado por administrador',
      );
    }

    // Generar JWT
    return this.generarToken(usuario);
  }

  /**
   * Registrar nuevo usuario
   * @param registroDto Email, password y datos personales
   * @returns JWT y datos del usuario
   */
  async registrarse(registroDto: RegistroDto): Promise<TokenDto> {
    // Crear usuario (el servicio valida que email no exista)
    const usuarioCreado = await this.usuariosService.crear(registroDto);

    // Generar JWT para usuario recien registrado
    return this.generarToken(usuarioCreado);
  }

  /**
   * Generar JWT para usuario
   * @param usuario Usuario autenticado
   * @returns Token JWT con datos del usuario
   */
  private generarToken(usuario: Usuario): TokenDto {
    const payload = {
      sub: usuario.id, // Subject (id del usuario)
      email: usuario.email,
      id: usuario.id,
      nombre: usuario.nombre,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro',
      expiresIn: process.env.JWT_EXPIRATION || '7d',
    });

    return {
      accessToken: token,
      tipo: 'Bearer',
      expiresIn: process.env.JWT_EXPIRATION || '7d',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
      },
    };
  }

  /**
   * Verificar que JWT sea valido (usado por JwtGuard)
   * @param token JWT a validar
   * @returns Payload decodificado
   */
  async verificarToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro',
      });
    } catch (error) {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }

  /**
   * Cambiar contraseña de usuario autenticado
   * @param usuarioId ID del usuario
   * @param passwordActual Password actual (para validacion)
   * @param passwordNueva Nueva password
   */
  async cambiarPassword(
    usuarioId: string,
    passwordActual: string,
    passwordNueva: string,
  ): Promise<void> {
    const usuario = await this.usuariosService.obtenerPorEmail(
      (await this.usuariosService.obtenerPorId(usuarioId)).email,
    );

    // Validar password actual
    const passwordValido = await this.usuariosService.validarPassword(
      passwordActual,
      usuario.password,
    );

    if (!passwordValido) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Actualizar password
    await this.usuariosService.actualizar(usuarioId, {
      password: passwordNueva,
    });
  }
}
