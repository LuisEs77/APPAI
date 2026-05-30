# Etapa de construcción
FROM node:22-slim AS builder

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Compilar el proyecto
RUN pnpm run build

# Etapa de producción
FROM node:22-slim

WORKDIR /app

# Instalar pnpm en producción para manejar scripts si es necesario
RUN npm install -g pnpm

# Copiar solo lo necesario desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]
