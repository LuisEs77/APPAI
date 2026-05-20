import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IaService } from './ia.service';

@Module({
  imports: [HttpModule], // Necesario para hacer llamadas HTTP locales
  providers: [IaService],
  exports: [IaService]     // Lo exportamos para poder usarlo en el módulo de gastos
})
export class IaModule {}