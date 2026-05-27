import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GastosModule } from './gastos/gastos.module';
import { IaModule } from './ia/ia.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ReportesModule } from './reportes/reportes.module';
import { Recibo } from './gastos/entities/recibo.entity';
import { Usuario } from './usuarios/entities/usuario.entity';

/**
 * Modulo Principal
 * Configura TypeORM con Postgres y carga todos los modulos de la aplicacion
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'gastos_db',
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
