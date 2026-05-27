# Arquitectura de Produccion - Control de Gastos Multiusuario

## Vision General

Sistema de captura y procesamiento de facturas en Guatemala con autenticacion multiusuario, procesamiento de IA local (Ollama) y reportes automatizados.

### 🌟 Evolución hacia Arquitectura Empresarial (Visión Senior)
Para garantizar alta disponibilidad (HA), escalabilidad y tolerancia a fallos en un entorno de producción real con miles de usuarios, la arquitectura incorpora los siguientes pilares:
- **Desacoplamiento asíncrono:** Uso de colas (Redis/BullMQ) para el procesamiento de IA (Ollama), evitando bloquear el servidor REST durante la inferencia de la imagen.
- **Almacenamiento en la Nube:** Las imágenes no deben almacenarse en Base64 en la base de datos a largo plazo; se recomienda delegar el almacenamiento a **AWS S3** o **Google Cloud Storage** usando URLs prefirmadas.
- **Migración a Motor Concurrente:** Transición de SQLite a **PostgreSQL** para manejar bloqueos a nivel de fila y alta concurrencia transaccional de forma segura.

## Estructura del Proyecto

```
ProyectoIA/
├── backend-gastos/          # NestJS - API REST
│   ├── src/
│   │   ├── auth/           # Modulo de autenticacion JWT/Passport
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── local.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── registro.dto.ts
│   │   │       └── token.dto.ts
│   │   ├── usuarios/       # Modulo de usuarios
│   │   │   ├── usuarios.controller.ts
│   │   │   ├── usuarios.service.ts
│   │   │   ├── usuarios.module.ts
│   │   │   ├── entities/
│   │   │   │   └── usuario.entity.ts
│   │   │   └── dto/
│   │   │       └── crear-usuario.dto.ts
│   │   ├── gastos/         # Modulo de gastos (refactorizado)
│   │   │   ├── gastos.controller.ts
│   │   │   ├── gastos.service.ts
│   │   │   ├── gastos.module.ts
│   │   │   ├── entities/
│   │   │   │   └── recibo.entity.ts (con relacion a Usuario)
│   │   │   └── dto/
│   │   │       ├── procesar-recibo.dto.ts
│   │   │       ├── filtro-recibos.dto.ts
│   │   │       └── recibo-procesado.dto.ts
│   │   ├── ia/             # Modulo de IA (refactorizado)
│   │   │   ├── ia.controller.ts
│   │   │   ├── ia.service.ts
│   │   │   ├── ia.module.ts
│   │   │   └── prompts/
│   │   │       └── extractor-factura-v2.txt
│   │   ├── reportes/       # Modulo de reportes
│   │   │   ├── reportes.controller.ts
│   │   │   ├── reportes.service.ts
│   │   │   ├── reportes.module.ts
│   │   │   └── templates/
│   │   │       └── reporte-mensual.template.ts
│   │   ├── database/       # Configuracion base de datos
│   │   │   └── database.module.ts
│   │   ├── config/         # Configuracion global
│   │   │   ├── env.config.ts
│   │   │   └── jwt.config.ts
│   │   ├── guards/         # Guards JWT
│   │   │   └── jwt.guard.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── ormconfig.ts
│   └── package.json
│
├── app-gastos/              # React Native Expo - Frontend
│   ├── app/                 # Carpeta de rutas (Expo Router)
│   │   ├── (auth)/         # Grupo de rutas no autenticadas
│   │   │   ├── _layout.tsx
│   │   │   ├── iniciar-sesion.tsx
│   │   │   ├── crear-cuenta.tsx
│   │   │   └── olvido-password.tsx
│   │   ├── (app)/          # Grupo de rutas autenticadas
│   │   │   ├── _layout.tsx  (Drawer Navigator)
│   │   │   ├── inicio.tsx
│   │   │   ├── historial.tsx
│   │   │   ├── perfil.tsx
│   │   │   └── configuracion.tsx
│   │   ├── _layout.tsx     (Root layout)
│   │   └── index.tsx       (Redireccion)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── formulario-login.tsx
│   │   │   ├── formulario-registro.tsx
│   │   │   └── input-seguro.tsx
│   │   ├── gastos/
│   │   │   ├── capturador-factura.tsx
│   │   │   ├── visor-recibos.tsx
│   │   │   ├── filtros-historial.tsx
│   │   │   └── tarjeta-recibo.tsx
│   │   ├── comunes/
│   │   │   ├── encabezado.tsx
│   │   │   ├── boton-primario.tsx
│   │   │   ├── indicador-carga.tsx
│   │   │   └── alerta-error.tsx
│   │   └── drawer/
│   │       └── menu-lateral.tsx
│   ├── services/
│   │   ├── api.service.ts     (Configuracion HTTP)
│   │   ├── auth.service.ts    (Logica autenticacion cliente)
│   │   ├── gastos.service.ts  (Consultas de gastos)
│   │   └── almacenamiento.ts  (AsyncStorage)
│   ├── constants/
│   │   ├── colores.ts         (Paleta corporativa)
│   │   ├── textos.ts          (Textos sin acentos)
│   │   └── api-endpoints.ts
│   ├── hooks/
│   │   ├── use-autenticacion.ts
│   │   ├── use-gastos.ts
│   │   └── use-camara.ts
│   ├── context/
│   │   └── auth-context.tsx   (Context API para estado global)
│   ├── types/
│   │   ├── usuario.ts
│   │   ├── recibo.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── validaciones.ts
│   │   ├── formatos.ts
│   │   └── manejo-errores.ts
│   ├── app.json
│   ├── expo-env.d.ts
│   ├── package.json
│   └── tsconfig.json
│
└── ARQUITECTURA_PRODUCCION.md (este archivo)
```

## Flujo de Autenticacion

1. Usuario ingresa credenciales en SignIn
2. Backend valida credenciales de forma segura. Para protección, se recomienda implementar **Rate Limiting (Throttle)** para mitigar ataques de fuerza bruta.
3. Backend retorna JWT + datos usuario (el JWT nunca debe incluir información sensible o PII en el payload).
4. Frontend almacena token. *Best Practice*: Usar **SecureStore** de Expo en lugar de AsyncStorage para guardar el JWT encriptado nativamente.
5. Cada peticion incluye token en header Authorization.
6. Backend valida JWT en guard antes de procesar.

## Flujo de Procesamiento de Facturas

1. Usuario captura foto desde camara/galeria.
2. Frontend recorta imagen de factura.
3. Backend recibe imagen base64. 
   - *Nota de Rendimiento:* Subir la imagen a un pre-signed URL de S3 aligera el payload al backend, pasando solo la URL.
4. Ollama procesa imagen y extrae datos. (Aislado de ser posible en Worker Thread / Microservicio).
5. Se almacena recibo vinculado al usuario. Un hash SHA-256 previene duplicados (`DuplicidadService`).
6. Frontend notifica exito al usuario mediante WebSockets o Polling si el proceso es asíncrono.

## Modelado de Base de Datos (PostgreSQL)

### Tabla Usuarios
- id (UUID, PK)
- email (VARCHAR, UNIQUE, Indexed)
- password (VARCHAR, hasheada bcrypt 12+ rounds)
- nombre (VARCHAR)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)

### Tabla Recibos
- id (UUID, PK)
- usuarioId (UUID, FK -> Usuarios, Indexed)
- comercio (VARCHAR)
- fecha (DATE)
- categoria (VARCHAR, Indexed)
- total (DECIMAL, precision 10,2)
- moneda (VARCHAR, default 'Q')
- imagen_hash (VARCHAR, UNIQUE) - *Prevención anti-duplicidad de Fase 2*
- imagen_url / imagen (TEXT)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)

## Guia de Inicio Rapido

### 1. Requisitos Previos
- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- Docker y Docker Compose
- Ollama corriendo localmente (`ollama run neural-chat`)

### 2. Levantar el Backend
```bash
cd backend-gastos
pnpm install
# Copiar variables de entorno
cp .env.example .env
# Iniciar Base de Datos (Postgres)
docker compose up -d
# Iniciar servidor en modo desarrollo
pnpm run start:dev
```

### 3. Levantar el Frontend
```bash
cd app-gastos
pnpm install
# Iniciar Expo
npx expo start
```

## Infraestructura y Observabilidad (Pipeline CI/CD)

- **Contenedores**: Empaquetado de la API NestJS vía Docker y base de datos PostgreSQL. 
- **Despliegue Continuo**: Integración con GitHub Actions.
- **Observabilidad**: Integración nativa con **Sentry** (Manejo de excepciones en Expo y NestJS), **Winston/Pino** para log estructurado JSON, y monitorización de Node.js via APM.
- **Seguridad Perimetral**: Uso de CORS estricto, Helmet en NestJS para cabeceras seguras, y limitador de peticiones globales (`@nestjs/throttler`).

## Paleta Corporativa

- Azul Principal: #003366 (RGB: 0, 51, 102)
- Azul Claro: #0055AA (RGB: 0, 85, 170)
- Gris Oscuro: #333333 (RGB: 51, 51, 51)
- Gris Claro: #EEEEEE (RGB: 238, 238, 238)
- Blanco: #FFFFFF (RGB: 255, 255, 255)
- Verde Exito: #27AE60 (RGB: 39, 174, 96)
- Rojo Error: #E74C3C (RGB: 231, 76, 60)

## Restricciones de Desarrollo

- SIN EMOJIS en interfaz
- SIN ACENTOS en textos de UI
- Bordes redondeados (borderRadius: 8-12px)
- Sombras sutiles para profundidad
- Tipografia: fonts de sistema (San Francisco en iOS, Roboto en Android)
- Espaciado consistente (multiples de 8px)
- **Código Limpio**: Uso estricto de Tipado, principios SOLID e inyección de dependencias. Evitar el uso de `any` en TypeScript.

## Variables de Entorno Requeridas

### Backend
```
DATABASE_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=gastos_db
JWT_SECRET=tu_secreto_jwt_super_seguro
JWT_EXPIRATION=7d
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=neural-chat
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_USER=tu_email@gmail.com
NODEMAILER_PASS=tu_app_password
```

### Frontend
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=Control de Gastos
```

## Proximos Pasos

1. [x] Definir arquitectura
2. [x] Implementar backend: auth + usuarios
3. [x] Implementar backend: gastos (incluye fase 2 Anti-duplicidad)
4. [x] Implementar backend: IA
5. [x] Implementar backend: reportes
6. [x] Configurar frontend: estructura rutas
7. [x] Implementar pantallas autenticacion
8. [x] Implementar pantalla captura (y Multi-captura de Fase 2)
9. [x] Implementar historial y filtros
10. [x] **Migración a PostgreSQL** completada ✅
11. [ ] Implementar **Sentry y Logging Estructurado**
12. [ ] Testing e2e automatizado
13. [x] Integrar **Expo SecureStore** en reemplazo de AsyncStorage para Tokens
14. [ ] Deployment mediante Docker y GitHub Actions

## Estado Actual (26 de Mayo 2026)

### BACKEND - COMPLETADO 100% ✅
- Compilación: SIN ERRORES
- Módulos completados: Auth, Usuarios, Gastos, IA, Reportes, Guards
- **Base de datos: Migración a PostgreSQL exitosa usando Docker** ✅
- Autenticación: JWT con Passport completamente integrado
- IA: Ollama integration lista (neural-chat model)
- Reportes: Excel + Email con Nodemailer + Integración con Telegram de Fase 2.

### FRONTEND - EN REFINAMIENTO 🚀
- Dependencias: Instaladas y actualizadas (incluye expo-image-manipulator y uuid)
- Estructura de rutas: Expo Router configurado
- Servicios creados:
  - `auth.service.ts` ✅ Login, registro, sesion
  - `gastos.service.ts` ✅ CRUD recibos, reportes
  - `almacenamiento.ts` ✅ Migración a **Expo SecureStore** completada ✅
  - `api.service.ts` (base con interceptores JWT)
- Componentes y Pantallas: Implementados ✅ (Incluyendo ImageCarousel y CropModal)

**Próximos pasos frontend:**
1. Testing integral
2. Refinamiento de UI/UX
3. Pruebas de integración con el nuevo motor PostgreSQL.

