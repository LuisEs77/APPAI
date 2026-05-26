import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { GastosModule } from '../gastos/gastos.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

/**
 * Modulo de Reportes
 * Maneja generacion de reportes y envio por correo electronico
 */
@Module({
  imports: [GastosModule, UsuariosModule],
  providers: [ReportesService],
  controllers: [ReportesController],
})
export class ReportesModule {}
