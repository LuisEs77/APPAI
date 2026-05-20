import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express'; // 👈 1. IMPORTAMOS ESTO DE EXPRESS

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // 👇 2. AÑADIMOS ESTAS DOS LÍNEAS (LA SOLUCIÓN AL 413)
  // Le decimos al backend que acepte paquetes de hasta 50 Megabytes
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Escuchando en todas las interfaces
  await app.listen(3000, '0.0.0.0');
}
bootstrap();