import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastosController } from './gastos.controller';
import { GastosService } from './gastos.service';
import { IaModule } from '../ia/ia.module';
import { Recibo } from './entities/recibo.entity';

/**
 * Modulo de Gastos (Recibos)
 * Maneja procesamiento y consulta de facturas
 * Depende de IaModule para procesamiento con IA
 */
@Module({
  imports: [IaModule, TypeOrmModule.forFeature([Recibo])],
  controllers: [GastosController],
  providers: [GastosService],
  exports: [GastosService],
})
export class GastosModule {}