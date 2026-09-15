# =========================================
# Dockerfile (raiz do projeto Angular)
# =========================================

# --- Etapa 1: build da aplicação Angular ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# --- Etapa 2: servir os arquivos estáticos com Nginx ---
FROM nginx:alpine AS runtime

# Ajuste "biblioteca" abaixo se o outputPath no angular.json tiver outro nome
COPY --from=build /app/dist/biblioteca /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]