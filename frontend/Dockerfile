# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Allow Node / ng build to use up to 4 GB of heap.
# Without this Docker Desktop on Windows (default 2 GB limit) kills the process
# mid-compile with an EOF / OOM error.
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ── Stage 2: serve ──────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=build /app/dist/frontend/browser/ /usr/share/nginx/html/
# Guardar nginx.conf como plantilla; BACKEND_HOST se sustituye al arrancar
COPY nginx.conf /etc/nginx/conf.d/app.conf.template

# Host del backend (nombre de servicio en docker-compose)
ENV BACKEND_HOST=backend:8080

EXPOSE 80

# envsubst '${BACKEND_HOST}' sólo reemplaza esa variable, dejando $uri etc intactos
CMD ["/bin/sh", "-c", \
     "envsubst '${BACKEND_HOST}' < /etc/nginx/conf.d/app.conf.template \
      > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
