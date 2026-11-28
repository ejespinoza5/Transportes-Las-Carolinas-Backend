#!/usr/bin/env bash
# =====================================================================
# Respaldo automático de la base de datos (para el VPS)
#
# - Lee los datos de conexión del .env del backend (DB_HOST, DB_USER,
#   DB_PASSWORD, DB_NAME). No hay contraseñas escritas en este archivo.
# - Guarda un .sql.gz por ejecución en /root/backups_bd
# - Borra los respaldos con más de 14 días
#
# Probar a mano:   bash scripts/backup_bd.sh
# Programar diario (3:00 am):  crontab -e  y agregar la línea:
#   0 3 * * * bash /var/www/las_carolinas/Transportes-Las-Carolinas-Backend/scripts/backup_bd.sh >> /root/backups_bd/backup.log 2>&1
# =====================================================================
set -euo pipefail

DIR_BACKEND="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESTINO="${DESTINO_BACKUPS:-/root/backups_bd}"
DIAS_A_CONSERVAR="${DIAS_A_CONSERVAR:-14}"

# Leer una variable del .env sin ejecutarlo (por si tiene espacios o símbolos)
leer_env() {
  grep -E "^$1=" "$DIR_BACKEND/.env" | tail -1 | cut -d= -f2- | sed -E 's/^["'\'']//; s/["'\'']$//; s/\r$//'
}

DB_HOST="$(leer_env DB_HOST)"
DB_USER="$(leer_env DB_USER)"
DB_PASSWORD="$(leer_env DB_PASSWORD)"
DB_NAME="$(leer_env DB_NAME)"

mkdir -p "$DESTINO"
chmod 700 "$DESTINO"

# Pasar la contraseña por un archivo temporal (no queda visible en la lista de procesos)
CNF="$(mktemp)"
trap 'rm -f "$CNF"' EXIT
chmod 600 "$CNF"
printf '[client]\nhost=%s\nuser=%s\npassword="%s"\n' "${DB_HOST:-localhost}" "$DB_USER" "$DB_PASSWORD" > "$CNF"

ARCHIVO="$DESTINO/${DB_NAME}_$(date +%F_%H%M).sql.gz"

mysqldump --defaults-extra-file="$CNF" \
  --single-transaction --routines --triggers --no-tablespaces \
  "$DB_NAME" | gzip > "$ARCHIVO"

chmod 600 "$ARCHIVO"
echo "$(date '+%F %T') Respaldo creado: $ARCHIVO ($(du -h "$ARCHIVO" | cut -f1))"

# Borrar respaldos viejos
find "$DESTINO" -name "${DB_NAME}_*.sql.gz" -type f -mtime +"$DIAS_A_CONSERVAR" -print -delete
