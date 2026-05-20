# 🚀 Fase 2: Guía Completa de Implementación

## 📋 Resumen de Cambios

### ✅ Backend (NestJS)

#### 1. **Dependencias Agregadas**
```bash
- @nestjs/typeorm: ORM para manejo de base de datos
- typeorm: Framework ORM
- sqlite3: Base de datos SQLite
```

#### 2. **Nuevas Entidades**
- **`Recibo.entity.ts`**: Entidad TypeORM con campos:
  - `id` (UUID primario)
  - `imagen_hash` (SHA-256, UNIQUE para anti-duplicidad)
  - `fecha`, `comercio`, `categoria`, `total`, `estado`
  - `created_at`, `updated_at` (timestamps automáticos)

#### 3. **Nuevos Servicios**
- **`DuplicidadService`**: Valida y previene recibos duplicados
  - Genera hash SHA-256 de cada imagen
  - Lanza excepción `409 Conflict` si existe duplicado
  - Validación secundaria: comercio + fecha + total

#### 4. **Cambios en Gastos.Service**
- `procesarRecibo()`: Actualizado con validación anti-duplicidad y guardado en BD
- `procesarMultiplesRecibos()`: NUEVO - itera sobre array de imágenes
- `obtenerTodosRecibos()`: NUEVO - obtiene historial de la BD
- `generarYEnviarExcel()`: Actualizado para usar datos de BD

#### 5. **Nuevos Endpoints**
```typescript
POST /gastos/procesar           // Fase 1 - Una imagen (mantiene compatibilidad)
POST /gastos/procesar-multiples // Fase 2 - Múltiples imágenes
GET  /gastos/historial          // NUEVO - Obtener histórico
POST /gastos/reporte            // Mejorado - Usa datos de BD
```

#### 6. **Configuración de Base de Datos**
```typescript
// App.module.ts
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'gastos.db',
  entities: [Recibo],
  synchronize: true,
})
```

---

### ✅ Frontend (React Native)

#### 1. **Dependencias Agregadas**
```bash
- expo-image-manipulator: Edición nativa de imágenes
- react-native-uuid: Generador de IDs únicos
```

#### 2. **Nuevos Componentes**

**`ImageCarousel.tsx`**
- Carrusel swipeable de imágenes
- Botón eliminar por imagen
- Indicador de posición (X / Total)
- Indicadores de puntos (dots)

**`CropModal.tsx`**
- Modal de recorte con preview
- Controles deslizantes para ajustar área de recorte
- Integración con `expo-image-manipulator`
- Compresión automática de imagen recortada

**`ProcessingStatus.tsx`**
- Modal de estado durante procesamiento
- Barra de progreso
- Contadores de: exitosas, duplicadas, errores
- Detalles de errores si existen

#### 3. **Cambios en index.tsx (Pantalla Principal)**
- Array de imágenes con estructura `ImageItem`
- Estados para modal de recorte y estado de procesamiento
- Función `tomarFoto()`: Captura una imagen
- Función `seleccionarDelGaleria()`: Selecciona múltiples imágenes
- Función `abrirRecortador()`: Abre modal de recorte
- Función `procesarTodasLasImagenes()`: Envía al endpoint `/procesar-multiples`
- Función `verHistorial()`: Llamada a `GET /historial`
- Botones nuevos: "Galería", "Recortar Imagen", "Procesar Todas"

---

## 🔧 Instalación y Setup

### Backend

1. **Instalar dependencias**
```bash
cd backend-gastos
npm install
```

2. **Ejecutar en modo desarrollo**
```bash
npm run start:dev
```

Esto creará automáticamente `gastos.db` en la raíz del proyecto.

3. **Verificar configuración de Ngrok**
```bash
# En otra terminal, inicia Ngrok si no lo has hecho
ngrok http 3000
# Copia la URL y actualiza URL_BACKEND en el frontend
```

---

### Frontend

1. **Instalar dependencias**
```bash
cd app-gastos
npm install
```

2. **Actualizar URL_BACKEND**
Abre `app/(tabs)/index.tsx` y reemplaza:
```typescript
const URL_BACKEND = 'https://tu-ngrok-url.ngrok-free.dev/gastos';
```

3. **Ejecutar en Android/iOS**
```bash
npm run android  // Android
npm run ios      // iOS
npm run web      // Web (si aplica)
```

---

## 📊 Flujo de Uso

### Escenario 1: Procesar Múltiples Recibos

1. Usuario abre la app
2. Toca **"Tomar Foto"** o **"Galería"** para agregar 1 o más imágenes
3. (Opcional) Toca **"Recortar Imagen Actual"** para ajustar la imagen
4. Una vez con todas las imágenes, toca **"Procesar Todas"**
5. La app envía el array de Base64 al backend
6. Backend:
   - Itera cada imagen
   - Valida anti-duplicidad (hash SHA-256)
   - Si es duplicado → agrega a lista de duplicados (409)
   - Si es nuevo → envía a IA → guarda en BD
7. Devuelve resumen: exitosos, duplicados, errores
8. Frontend muestra `ProcessingStatus` con resultados

### Escenario 2: Consultar Historial

1. Usuario toca **"Ver Historial"**
2. Frontend hace GET a `/gastos/historial`
3. Backend devuelve array de `Recibo` desde BD
4. Frontend muestra las últimas 5 con total registrado

### Escenario 3: Generar Reporte

1. Usuario toca **"Excel a Telegram"**
2. Frontend hace POST a `/gastos/reporte`
3. Backend:
   - Obtiene todos los recibos de BD
   - Genera Excel con datos reales (no simulados)
   - Calcula totales
   - Envía a Telegram
4. Usuario recibe archivo en Telegram

---

## 🛡️ Sistema Anti-Duplicidad Detallado

### Método Primario: Hash SHA-256

```typescript
// Cada imagen se convierte en hash único
imagen: "iVBORw0KGgoAAAANS..."
↓
hash: "a3f45b8c9e2d1f4a7b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f"
↓
Se busca en BD si existe imagen_hash = "a3f45b8c..."
↓
Si existe → Lanzar 409 Conflict
Si no existe → Procesar y guardar
```

### Método Secundario: Validación Combinada

```typescript
// Si por alguna razón quieres otra validación
comercio = "Supermercado La Torre"
fecha = "2026-05-15"
total = 450.50
↓
Buscar en BD: WHERE comercio = "..." AND fecha = "..." AND total = "..."
↓
Útil para casos con ligeras variaciones de imagen
```

### Respuesta 409 Conflict

```json
{
  "statusCode": 409,
  "message": "Este recibo ya ha sido registrado anteriormente.",
  "error": "Conflict",
  "detalles": {
    "comercio": "Supermercado La Torre",
    "fecha": "2026-05-15",
    "total": 450.50,
    "creado_en": "2026-05-15T10:30:00.000Z"
  }
}
```

---

## 📝 Estructura de DTOs

### Request: Procesar Múltiples
```typescript
{
  "images": [
    "iVBORw0KGgoAAAANS...", // Base64 imagen 1
    "iVBORw0KGgoAAAANS...", // Base64 imagen 2
    "iVBORw0KGgoAAAANS..."  // Base64 imagen 3
  ]
}
```

### Response: Procesamiento Completado
```json
{
  "exitosos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "comercio": "Supermercado La Torre",
      "fecha": "2026-05-15",
      "categoria": "Alimentación",
      "total": 450.50,
      "estado": "Registrado",
      "created_at": "2026-05-15T10:30:00.000Z"
    }
  ],
  "duplicados": [
    {
      "index": 1,
      "razon": "El recibo ya existe en la base de datos",
      "detalles": { ... }
    }
  ],
  "errores": [
    {
      "index": 2,
      "error": "Los datos extraídos están incompletos..."
    }
  ],
  "resumen": {
    "total_procesados": 3,
    "total_exitosos": 1,
    "total_duplicados": 1,
    "total_errores": 1
  }
}
```

---

## 🗄️ Base de Datos (SQLite)

### Tabla: `recibos`

| Columna | Tipo | Único | Notas |
|---------|------|-------|-------|
| id | UUID | ✅ | PK, autogenerado |
| imagen_hash | VARCHAR(64) | ✅ | SHA-256, previene duplicados |
| fecha | DATE | | Fecha de la compra |
| comercio | VARCHAR(255) | | Nombre del comercio |
| categoria | VARCHAR(100) | | Categoría del gasto |
| total | DECIMAL(10,2) | | Monto total |
| estado | VARCHAR(50) | | Estado (ej: "Registrado") |
| imagen_base64_preview | TEXT | | (Opcional) Preview |
| created_at | TIMESTAMP | | Automático |
| updated_at | TIMESTAMP | | Automático |

### Índices
```sql
CREATE UNIQUE INDEX idx_imagen_hash ON recibos(imagen_hash);
CREATE INDEX idx_comercio_fecha_total ON recibos(comercio, fecha, total);
```

---

## 🐛 Debugging y Troubleshooting

### Backend
```bash
# Ver logs de SQL
# En app.module.ts, cambiar:
logging: true,  // Para ver queries

# Resetear BD (elimina datos)
rm gastos.db

# Verificar estructura
sqlite3 gastos.db ".tables"
```

### Frontend
```bash
# Logs de la app
console.log('Estado:', images.length);

# Ver errores de red
# Abre DevTools en el emulador/dispositivo
```

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module 'typeorm'` | Falta instalar | `npm install` en backend |
| `413 Payload Too Large` | Imagen muy grande | Aumentar límite en `main.ts` |
| `409 Conflict` | Recibo duplicado | Normal, es el sistema anti-dup |
| `Network request failed` | Ngrok desconectado | Reiniciar Ngrok |
| `La imagen no se abre` | Formato Base64 inválido | Verificar `expo-image-picker` |

---

## 🎯 Próximos Pasos (Fase 3)

1. **Autenticación**: Agregar JWT para usuarios
2. **Categorías Dinámicas**: Permitir crear categorías personalizadas
3. **Gráficas**: Dashboard con gastos por categoría
4. **Sincronización**: Backend en cloud (Railway, Render, AWS)
5. **Notificaciones**: Push notifications para recordatorios

---

## 📞 Soporte Rápido

Si algo no funciona:

1. Verifica que ambos servidores estén corriendo:
   - Backend: `npm run start:dev` en `backend-gastos/`
   - Frontend: `npm run android/ios` en `app-gastos/`

2. Verifica la URL de Ngrok en `index.tsx`

3. Revisa los logs en ambas terminales

4. Limpia cachés:
   ```bash
   # Backend
   rm -rf dist node_modules && npm install

   # Frontend
   rm -rf node_modules && npm install
   expo start --clear
   ```

¡Listo! 🎉 Tu **Fase 2** está completamente implementada.
