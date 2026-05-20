import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GastosModule } from './gastos/gastos.module';
import { IaModule } from './ia/ia.module';
import { Recibo } from './gastos/entities/recibo.entity';

@Module({
  imports: [
    // Configuración de TypeORM con SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'gastos.db', // Base de datos SQLite en la raíz del proyecto
      entities: [Recibo],
      synchronize: true, // En desarrollo: crea tablas automáticamente. En producción: usar migraciones
      logging: false, // Cambiar a true para ver las queries SQL
    }),
    GastosModule,
    IaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
