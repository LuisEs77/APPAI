import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express'; // 👈 1. IMPORTAMOS ESTO DE EXPRESS

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Establecer prefijo global PRIMERO
  app.setGlobalPrefix('api');

  // 2. Configurar CORS ultra-permisivo para depuración
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: '*',
  });

  // 3. Middleware para ver EXACTAMENTE qué llega al servidor
  app.use((req, res, next) => {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log(`[Incoming Request] ${req.method} ${fullUrl}`);
    next();
  });
  
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