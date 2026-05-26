import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';

/**
 * Modulo de Usuarios
 * Importa el repositorio de Usuario y exporta el servicio para otros modulos
 */
@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], // Exportar para uso en otros modulos (Auth, etc)
})
export class UsuariosModule {}
