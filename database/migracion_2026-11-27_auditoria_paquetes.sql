-- =====================================================================
-- NUEVO (2026-11-27): Registro de quién elimina (desactiva) paquetes
-- Se llena desde el backend al:
--   - eliminar un paquete          (DELETE /paquetes/:id)              -> 'eliminar'
--   - eliminar varios seleccionados (POST /paquetes/eliminar/multiple) -> 'eliminar_multiple'
--   - eliminar un grupo completo   (DELETE /grupos/:id)                -> 'eliminar_grupo'
-- Consulta: GET /paquetes/auditoria/eliminaciones?guia=&id_grupo=&limit=
-- No tiene claves foráneas a propósito: el registro se conserva aunque
-- cambien o se borren usuarios/paquetes.
-- =====================================================================
CREATE TABLE IF NOT EXISTS `auditoria_paquetes` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `id_Paquete` int NOT NULL,
  `Guia` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_grupo` int DEFAULT NULL,
  `accion` enum('eliminar','eliminar_multiple','eliminar_grupo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `email_usuario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_auditoria_guia` (`Guia`),
  KEY `idx_auditoria_paquete` (`id_Paquete`),
  KEY `idx_auditoria_grupo` (`id_grupo`),
  KEY `idx_auditoria_usuario` (`id_usuario`),
  KEY `idx_auditoria_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
