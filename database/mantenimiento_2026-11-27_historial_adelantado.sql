-- =====================================================================
-- Mantenimiento 2026-11-27: limpiar historial "adelantado"
--
-- Paquetes que retrocedieron de estado (cambio manual o reimportación)
-- conservaban en historial_estados entradas de estados POSTERIORES a su
-- estado actual. El tracking ya no las muestra (arreglado en el código),
-- pero siguen apareciendo en el historial del panel de admin.
--
-- Este script NO BORRA nada: solo pasa esas filas a estado 'inactivo'
-- y antes guarda una copia de ellas en una tabla de respaldo.
--
-- Uso en el VPS:  mysql -u root -p tracking < database/mantenimiento_2026-11-27_historial_adelantado.sql
-- =====================================================================

-- 1. Ver cuántas filas se van a desactivar (informativo)
SELECT COUNT(*) AS filas_a_desactivar, COUNT(DISTINCT h.id_Paquete) AS paquetes
FROM historial_estados h
JOIN paquete p  ON p.id_Paquete = h.id_Paquete
JOIN estados ea ON ea.id_estado = p.id_estado
JOIN estados eh ON eh.id_estado = h.id_estado
WHERE p.estado = 'activo' AND h.estado = 'activo' AND eh.orden > ea.orden;

START TRANSACTION;

-- 2. Copia de respaldo de las filas que se van a cambiar
CREATE TABLE IF NOT EXISTS respaldo_historial_adelantado_20261127 AS
SELECT h.*
FROM historial_estados h
JOIN paquete p  ON p.id_Paquete = h.id_Paquete
JOIN estados ea ON ea.id_estado = p.id_estado
JOIN estados eh ON eh.id_estado = h.id_estado
WHERE p.estado = 'activo' AND h.estado = 'activo' AND eh.orden > ea.orden;

-- 3. Desactivar esas filas (sin borrar)
UPDATE historial_estados h
JOIN respaldo_historial_adelantado_20261127 r ON r.id_historial = h.id_historial
SET h.estado = 'inactivo'
WHERE h.estado = 'activo';

COMMIT;

-- 4. Verificación: debe dar 0
SELECT COUNT(*) AS filas_adelantadas_restantes
FROM historial_estados h
JOIN paquete p  ON p.id_Paquete = h.id_Paquete
JOIN estados ea ON ea.id_estado = p.id_estado
JOIN estados eh ON eh.id_estado = h.id_estado
WHERE p.estado = 'activo' AND h.estado = 'activo' AND eh.orden > ea.orden;

-- ---------------------------------------------------------------------
-- Para REVERTIR (volver a activar exactamente esas filas):
--   UPDATE historial_estados h
--   JOIN respaldo_historial_adelantado_20261127 r ON r.id_historial = h.id_historial
--   SET h.estado = 'activo';
-- ---------------------------------------------------------------------
