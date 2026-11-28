#!/usr/bin/env bash
# =====================================================================
# Despliegue del backend en el VPS
#
# Uso:  bash scripts/deploy.sh <nombre-app-pm2>
#
# 1. Respalda la base de datos antes de actualizar
# 2. Trae el código de GitHub (se detiene si hay archivos editados a mano)
# 3. Instala dependencias si cambiaron
# 4. Reinicia la app en PM2
# =====================================================================
set -euo pipefail

APP_PM2="${1:-}"
if [ -z "$APP_PM2" ]; then
  echo "Uso: bash scripts/deploy.sh <nombre-app-pm2>   (ver nombres con: pm2 list)"
  exit 1
fi

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "ERROR: hay archivos modificados a mano en el servidor:"
  git status --short --untracked-files=no
  echo "Revísalos antes de desplegar (no se cambió nada)."
  exit 1
fi

echo "==> Respaldo de la base de datos"
bash scripts/backup_bd.sh

ANTES="$(git rev-parse HEAD)"
echo "==> Actualizando código"
git pull --ff-only origin master
DESPUES="$(git rev-parse HEAD)"

if [ "$ANTES" = "$DESPUES" ]; then
  echo "No había cambios nuevos."
else
  git log --oneline "$ANTES..$DESPUES"
  if git diff --name-only "$ANTES" "$DESPUES" | grep -qE '^package(-lock)?\.json$'; then
    echo "==> Instalando dependencias"
    npm install --omit=dev
  fi
fi

echo "==> Reiniciando $APP_PM2"
pm2 restart "$APP_PM2"
pm2 status "$APP_PM2"
