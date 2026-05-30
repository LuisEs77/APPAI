# Etapa de construcción
FROM node:22-slim AS builder

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Instalar dependencias necesarias para Expo
RUN apt-get update && apt-get install -y git

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Para web se usa expo export
# RUN npx expo export --platform web

# En desarrollo con Docker, a veces es mejor simplemente servirlo
# Pero para un compose "listo para usar", usaremos el servidor de desarrollo web
EXPOSE 8081

# Comando para iniciar expo en modo web
CMD ["npx", "expo", "start", "--web", "--non-interactive"]
