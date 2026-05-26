import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GastosModule } from './gastos/gastos.module';
import { IaModule } from './ia/ia.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ReportesModule } from './reportes/reportes.module';
import { Recibo } from './gastos/entities/recibo.entity';
import { Usuario } from './usuarios/entities/usuario.entity';

const isPostgres = process.env.DATABASE_TYPE === 'postgres';

/**
 * Modulo Principal
 * Configura TypeORM con Postgres o SQLite y carga todos los modulos de la aplicacion
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: isPostgres ? 'postgres' : 'sqlite',
      ...(isPostgres
        ? {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'gastos_db',
          }
        : {
            database: process.env.DATABASE_PATH || 'gastos.db',
          }),
      entities: [Usuario, Recibo],
      synchronize: true, // En desarrollo: crea tablas automaticamente
      logging: false,
    }),
    AuthModule,
    UsuariosModule,
    GastosModule,
    IaModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
