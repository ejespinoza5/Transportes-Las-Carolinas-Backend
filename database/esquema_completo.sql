-- =====================================================================
-- Sistema Tracking - Transportes Las Carolinas
-- Esquema completo de la base de datos (solo estructura, sin datos)
-- Generado desde producción el 2026-11-27 + tabla nueva auditoria_paquetes
--
-- Es SEGURO ejecutarlo sobre una base existente: no contiene DROP ni
-- INSERT, y todas las tablas usan CREATE TABLE IF NOT EXISTS, así que
-- solo crea las tablas que falten (en producción: auditoria_paquetes).
--
-- Uso:  mysql -u root -p NOMBRE_BD < esquema_completo.sql
-- =====================================================================


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `casilleros_clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cedula` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `celular` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provincia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cod_postal` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cod_casillero` varchar(90) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `tipo_entrega` enum('domicilio','oficina') COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion_casa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calle_secundaria` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `hora_registro` time DEFAULT (curtime()),
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula` (`cedula`),
  UNIQUE KEY `cod_casillero` (`cod_casillero`),
  KEY `idx_clientes_usuario` (`id_usuario`),
  KEY `idx_clientes_estado` (`estado`),
  KEY `idx_clientes_cedula` (`cedula`),
  KEY `idx_clientes_casillero` (`cod_casillero`),
  KEY `idx_clientes_nombres` (`nombres`,`apellidos`),
  KEY `idx_clientes_ciudad` (`ciudad`,`provincia`),
  CONSTRAINT `casilleros_clientes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `codigos_verificacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT '0',
  `expira_en` datetime NOT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_codigos_email` (`email`),
  KEY `idx_codigos_codigo` (`codigo`),
  KEY `idx_codigos_expira` (`expira_en`),
  KEY `idx_codigos_email_usado` (`email`,`usado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `estados` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre_estado` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#808080',
  `orden` int NOT NULL DEFAULT '0',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `nombre_estado` (`nombre_estado`),
  KEY `idx_estados_orden` (`orden`),
  KEY `idx_estados_estado` (`estado`),
  KEY `idx_estados_nombre` (`nombre_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `grupos` (
  `id_grupo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicial` date DEFAULT NULL,
  `fecha_final` date DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_grupo`),
  KEY `idx_grupos_estado` (`estado`),
  KEY `idx_grupos_fechas` (`fecha_inicial`,`fecha_final`),
  KEY `idx_grupos_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `historial_estados` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_Paquete` int NOT NULL,
  `id_estado` int NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `fecha_cambio` date NOT NULL,
  `hora_cambio` time NOT NULL,
  `usuario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `idx_historial_paquete` (`id_Paquete`),
  KEY `idx_historial_estado` (`id_estado`),
  KEY `idx_historial_fecha` (`fecha_cambio`,`hora_cambio`),
  KEY `idx_historial_usuario` (`usuario`),
  KEY `idx_historial_paquete_fecha` (`id_Paquete`,`fecha_cambio` DESC),
  CONSTRAINT `historial_estados_ibfk_1` FOREIGN KEY (`id_Paquete`) REFERENCES `paquete` (`id_Paquete`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `historial_estados_ibfk_2` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id_estado`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `paquete` (
  `id_Paquete` int NOT NULL AUTO_INCREMENT,
  `Servicio` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Guia` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Fecha_Salida` date DEFAULT NULL,
  `Remitente` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Peso_LB` decimal(10,2) NOT NULL,
  `Courier` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_estado` int DEFAULT NULL,
  `guia_tramaco` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_grupo` int NOT NULL,
  `Fecha_registro` date DEFAULT NULL,
  `Hora_registro` time DEFAULT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_Paquete`),
  UNIQUE KEY `Guia` (`Guia`),
  KEY `idx_paquete_guia` (`Guia`),
  KEY `idx_paquete_estado` (`id_estado`),
  KEY `idx_paquete_estado_activo` (`estado`),
  KEY `idx_paquete_grupo` (`id_grupo`),
  KEY `idx_paquete_fecha_salida` (`Fecha_Salida`),
  KEY `idx_paquete_courier` (`Courier`),
  KEY `idx_paquete_guia_tramaco` (`guia_tramaco`),
  CONSTRAINT `paquete_ibfk_1` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id_estado`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `paquete_ibfk_2` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON UPDATE CASCADE,
  CONSTRAINT `paquete_chk_1` CHECK ((`Peso_LB` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `paquetes_clientes` (
  `id_asignacion` int NOT NULL AUTO_INCREMENT,
  `id_Paquete` int NOT NULL,
  `id_cliente` int NOT NULL,
  `peso_lb` decimal(10,2) DEFAULT NULL,
  `foto_paquete` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `fecha_asignacion` date NOT NULL DEFAULT (curdate()),
  `hora_asignacion` time NOT NULL DEFAULT (curtime()),
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asignacion`),
  UNIQUE KEY `uk_paquete_cliente` (`id_Paquete`,`id_cliente`),
  KEY `idx_paquetes_clientes_paquete` (`id_Paquete`),
  KEY `idx_paquetes_clientes_cliente` (`id_cliente`),
  KEY `idx_paquetes_clientes_estado` (`estado`),
  KEY `idx_paquetes_clientes_fecha` (`fecha_asignacion` DESC),
  CONSTRAINT `paquetes_clientes_ibfk_1` FOREIGN KEY (`id_Paquete`) REFERENCES `paquete` (`id_Paquete`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `paquetes_clientes_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `casilleros_clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `paquetes_clientes_chk_1` CHECK ((`peso_lb` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `recuperacion_password` (
  `id_recuperacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `token` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` datetime NOT NULL,
  `intentos_fallidos` int NOT NULL DEFAULT '0',
  `usado` enum('si','no') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'no',
  `ip_solicitud` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('activo','expirado','usado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id_recuperacion`),
  KEY `idx_recuperacion_token` (`token`),
  KEY `idx_recuperacion_email` (`email`),
  KEY `idx_recuperacion_estado` (`estado`),
  KEY `idx_recuperacion_fecha_expiracion` (`fecha_expiracion`),
  KEY `idx_recuperacion_usuario_estado` (`id_usuario`,`estado`),
  CONSTRAINT `recuperacion_password_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_roles_estado` (`estado`),
  KEY `idx_roles_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verificado` tinyint(1) NOT NULL DEFAULT '0',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash bcrypt',
  `id_rol` int NOT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `intentos_fallidos` int NOT NULL DEFAULT '0',
  `bloqueado_hasta` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuarios_email` (`email`),
  KEY `idx_usuarios_estado` (`estado`),
  KEY `idx_usuarios_rol` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;


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

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

