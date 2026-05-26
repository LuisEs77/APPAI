import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * JWT Guard
 * Valida que la solicitud incluya un JWT valido en el header Authorization
 * Se usa con @UseGuards(JwtGuard) en controladores
 */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Obtener token del header Authorization
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'Token no proporcionado. Use: Authorization: Bearer <token>',
      );
    }

    try {
      // Validar y decodificar JWT
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro',
      });

      // Almacenar usuario en request para acceso en controladores
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Token invalido o expirado');
    }

    return true;
  }

  /**
   * Extraer token del header Authorization
   * Formato esperado: "Bearer <token>"
   * @param request Request HTTP
   * @returns Token sin "Bearer " o null
   */
  private extraerToken(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
      throw new UnauthorizedException(
        'Formato de Authorization invalido. Use: Bearer <token>',
      );
    }

    return partes[1];
  }
}
