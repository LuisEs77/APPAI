import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastosController } from './gastos.controller';
import { GastosService } from './gastos.service';
import { DuplicidadService } from './services/duplicidad.service';
import { IaModule } from '../ia/ia.module';
import { Recibo } from './entities/recibo.entity';

@Module({
  imports: [IaModule, TypeOrmModule.forFeature([Recibo])],
  controllers: [GastosController],
  providers: [GastosService, DuplicidadService],
})
export class GastosModule {}