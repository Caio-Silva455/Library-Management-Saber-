# =========================================
# backend/Dockerfile
# =========================================
FROM node:20-alpine

WORKDIR /usr/src/app

# Copia apenas os manifests primeiro (melhor cache de camadas)
COPY package*.json ./

RUN npm ci --omit=dev

# Copia o restante do código do backend
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server.js"]