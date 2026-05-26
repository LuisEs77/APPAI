import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

/**
 * Modulo de Autenticacion
 * Configura JWT y exporta servicios de autenticacion
 */
@Module({
  imports: [
    UsuariosModule,
    JwtModule.register({
      global: true, // JWT disponible globalmente en la aplicacion
      secret: process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || '7d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
