#!/bin/bash
# ── MatchUp · Script de despliegue para VPS de clase ──────────────────────
# VPS: alumno2daw@asanrod603d
#
# Ejecutar desde el directorio raíz del proyecto:
#   bash deploy-vps.sh
# O desde fuera del VPS (sube archivos y despliega):
#   bash deploy-vps.sh --remote

set -euo pipefail

VPS_USER="alumno2daw"
VPS_HOST="asanrod603d"
VPS_DIR="/home/alumno2daw/matchup"

if [[ "${1:-}" == "--remote" ]]; then
  echo ">>> Subiendo archivos al VPS..."
  ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p ${VPS_DIR}"
  scp docker-compose.vps.yml .env.vps.example "${VPS_USER}@${VPS_HOST}:${VPS_DIR}/"

  echo ">>> Desplegando en el VPS..."
  ssh "${VPS_USER}@${VPS_HOST}" bash <<EOF
    cd ${VPS_DIR}
    [ ! -f .env ] && cp .env.vps.example .env && echo ".env creado desde example"
    docker compose -f docker-compose.vps.yml pull
    docker compose -f docker-compose.vps.yml up -d
    echo ">>> Estado de contenedores:"
    docker compose -f docker-compose.vps.yml ps
EOF

else
  # Ejecución local (dentro del VPS)
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  cd "${SCRIPT_DIR}"

  echo ">>> Copiando .env si no existe..."
  [ ! -f .env ] && cp .env.vps.example .env && echo ".env creado"

  echo ">>> Descargando imágenes de Docker Hub..."
  docker compose -f docker-compose.vps.yml pull

  echo ">>> Levantando servicios..."
  docker compose -f docker-compose.vps.yml up -d

  echo ""
  echo ">>> Estado de contenedores:"
  docker compose -f docker-compose.vps.yml ps

  echo ""
  echo "✓ MatchUp desplegado en http://asanrod603d"
fi
