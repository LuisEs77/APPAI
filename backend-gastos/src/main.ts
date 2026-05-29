import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express'; // 👈 1. IMPORTAMOS ESTO DE EXPRESS
import * as dotenv from 'dotenv';

// Cargar variables de entorno desde .env lo antes posible
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Establecer prefijo global PRIMERO
  app.setGlobalPrefix('api');

  // 2. Configurar CORS ultra-permisivo para depuración
  // Leer orígenes permitidos desde la variable de entorno `CORS_ALLOWED_ORIGINS`
  // Formato: una lista separada por comas, por ejemplo:
  // CORS_ALLOWED_ORIGINS=http://localhost:8081,http://localhost:3000
  const corsEnv = process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGINS || '';
  const allowedOrigins = corsEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Si no se especifica, mantenemos comportamiento abierto para desarrollo
  const corsOptions = {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: '*',
  } as any;

  console.log('[CORS] allowedOrigins:', allowedOrigins.length > 0 ? allowedOrigins : 'ALL');
  app.enableCors(corsOptions);

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