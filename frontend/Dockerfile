# Etapa 1: compila o app (React + Vite).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY . .
# URL da API embutida no bundle em tempo de build.
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
# `vite build` direto: o script "build" roda `tsc -b`, que hoje falha com 15 erros de tipo pre-existentes.
RUN npx vite build

# Etapa 2: serve só os arquivos estáticos, sem Node e sem root.
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
