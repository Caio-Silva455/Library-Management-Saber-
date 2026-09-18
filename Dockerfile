
# --- Etapa 1: build da aplicação Angular ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# --- Etapa 2: servir os arquivos estáticos com Nginx ---
FROM nginx:alpine AS runtime

# O builder novo do Angular (@angular/build:application) gera a saída
# dentro de uma subpasta "browser" — por isso o caminho abaixo inclui /browser.
# Ajuste "biblioteca" se o outputPath no angular.json tiver outro nome.
COPY --from=build /app/dist/biblioteca/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]