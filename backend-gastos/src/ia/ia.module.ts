import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';

/**
 * Modulo de IA
 * Configura integracion con IA para procesamiento de facturas
 */
@Module({
  imports: [HttpModule],
  controllers: [IaController],
  providers: [IaService],
  exports: [IaService],
})
export class IaModule {}