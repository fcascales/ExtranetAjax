-- MySQL Administrator dump 1.4
--
-- ------------------------------------------------------
-- Server version	5.1.41-3ubuntu12.9


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


--
-- Create schema acme
--

CREATE DATABASE IF NOT EXISTS acme;
USE acme;

--
-- Temporary table structure for view `acme`.`citas_horario`
--
DROP TABLE IF EXISTS `acme`.`citas_horario`;
DROP VIEW IF EXISTS `acme`.`citas_horario`;
CREATE TABLE `acme`.`citas_horario` (
  `id` int(11),
  `tipo` varchar(5),
  `tema` varchar(25),
  `titulo` varchar(142),
  `fecha` date,
  `hora` time,
  `duracion` double,
  `usuario` varchar(10),
  `colorear` varchar(7)
);

--
-- Temporary table structure for view `acme`.`tasks`
--
DROP TABLE IF EXISTS `acme`.`tasks`;
DROP VIEW IF EXISTS `acme`.`tasks`;
CREATE TABLE `acme`.`tasks` (
  `id` varbinary(16),
  `summary` varchar(25),
  `description` varchar(128),
  `dtstart` datetime,
  `dtend` datetime,
  `calendar` varchar(10),
  `sequence` varbinary(13)
);

--
-- Temporary table structure for view `acme`.`tasks_allday`
--
DROP TABLE IF EXISTS `acme`.`tasks_allday`;
DROP VIEW IF EXISTS `acme`.`tasks_allday`;
CREATE TABLE `acme`.`tasks_allday` (
  `id` varbinary(18),
  `summary` varchar(7),
  `description` varchar(50),
  `dtstart` date,
  `dtend` datetime,
  `calendar` varchar(7),
  `sequence` varchar(7)
);

--
-- Definition of table `acme`.`alumnos`
--

DROP TABLE IF EXISTS `acme`.`alumnos`;
CREATE TABLE  `acme`.`alumnos` (
  `id_alumno` int(10) NOT NULL AUTO_INCREMENT,
  `alumno` varchar(25) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `apellidos` varchar(25) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `correos` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `telefonos` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `direccion` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `cp` varchar(5) COLLATE latin1_spanish_ci DEFAULT NULL,
  `poblacion` varchar(25) COLLATE latin1_spanish_ci DEFAULT NULL,
  `nif` varchar(15) COLLATE latin1_spanish_ci DEFAULT NULL,
  `notas` longtext COLLATE latin1_spanish_ci,
  `fecha_alta` date DEFAULT NULL,
  `fecha_baja` date DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fuente` varchar(25) COLLATE latin1_spanish_ci DEFAULT NULL,
  `fecha_interes` datetime DEFAULT NULL,
  `curriculum` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `id_nivel_profesional` int(10) DEFAULT NULL,
  PRIMARY KEY (`alumno`,`apellidos`),
  UNIQUE KEY `id_alumno` (`id_alumno`),
  KEY `id_nivel_profesional` (`id_nivel_profesional`),
  CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`id_nivel_profesional`) REFERENCES `niveles_profesionales` (`id_nivel_profesional`)
) ENGINE=InnoDB AUTO_INCREMENT=2137570363 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`alumnos`
--

/*!40000 ALTER TABLE `alumnos` DISABLE KEYS */;
LOCK TABLES `alumnos` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;


--
-- Definition of table `acme`.`alumnos_cursos`
--

DROP TABLE IF EXISTS `acme`.`alumnos_cursos`;
CREATE TABLE  `acme`.`alumnos_cursos` (
  `id_alumno_curso` int(10) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(10) NOT NULL,
  `id_curso` varchar(10) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `modulos` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `importe` decimal(19,4) DEFAULT NULL,
  `cobrado` decimal(19,4) DEFAULT NULL,
  `pendiente` decimal(19,4) DEFAULT NULL,
  `rebaja` decimal(19,4) DEFAULT NULL,
  `fecha_alta` date DEFAULT NULL,
  `fecha_baja` date DEFAULT NULL,
  `id_ordenador` varchar(12) COLLATE latin1_spanish_ci DEFAULT NULL,
  `nivel_inicial` tinyint(3) unsigned DEFAULT NULL,
  `nivel_final` tinyint(3) unsigned DEFAULT NULL,
  `valoracion` longtext COLLATE latin1_spanish_ci,
  `posicion` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `fila` int(11) NOT NULL DEFAULT '0',
  `columna` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_alumno`,`id_curso`),
  UNIQUE KEY `Id CursoAlumno` (`id_alumno_curso`),
  KEY `id_curso` (`id_curso`),
  KEY `id_alumno` (`id_alumno`),
  CONSTRAINT `alumnos_cursos_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `alumnos_cursos_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2136671220 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`alumnos_cursos`
--

/*!40000 ALTER TABLE `alumnos_cursos` DISABLE KEYS */;
LOCK TABLES `alumnos_cursos` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `alumnos_cursos` ENABLE KEYS */;


--
-- Definition of table `acme`.`bancos`
--

DROP TABLE IF EXISTS `acme`.`bancos`;
CREATE TABLE  `acme`.`bancos` (
  `id_banco` int(10) NOT NULL AUTO_INCREMENT,
  `banco` varchar(25) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `cuenta_corriente` varchar(25) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `notas` longtext COLLATE latin1_spanish_ci,
  PRIMARY KEY (`banco`,`cuenta_corriente`),
  UNIQUE KEY `id_banco` (`id_banco`)
) ENGINE=InnoDB AUTO_INCREMENT=1079599573 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`bancos`
--

/*!40000 ALTER TABLE `bancos` DISABLE KEYS */;
LOCK TABLES `bancos` WRITE;
INSERT INTO `acme`.`bancos` VALUES  (1079599572,'Caixa','1024-0290-28-0002002055',NULL),
 (1,'Triodos','1021-0044-99-0001239011','');
UNLOCK TABLES;
/*!40000 ALTER TABLE `bancos` ENABLE KEYS */;


--
-- Definition of table `acme`.`citas`
--

DROP TABLE IF EXISTS `acme`.`citas`;
CREATE TABLE  `acme`.`citas` (
  `id_cita` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `duracion` double(15,5) NOT NULL,
  `tema` varchar(25) COLLATE latin1_spanish_ci NOT NULL,
  `titulo` varchar(50) COLLATE latin1_spanish_ci NOT NULL,
  `usuario` varchar(10) COLLATE latin1_spanish_ci NOT NULL,
  PRIMARY KEY (`fecha`,`hora`,`duracion`,`tema`,`titulo`,`usuario`),
  UNIQUE KEY `id_cita` (`id_cita`)
) ENGINE=InnoDB AUTO_INCREMENT=2117147535 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`citas`
--

/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
LOCK TABLES `citas` WRITE;
INSERT INTO `acme`.`citas` VALUES  (2117147534,'2011-02-22','10:00:00',4.00000,'Reunión','Importante','QUIM');
UNLOCK TABLES;
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;


--
-- Definition of table `acme`.`clientes`
--

DROP TABLE IF EXISTS `acme`.`clientes`;
CREATE TABLE  `acme`.`clientes` (
  `id_cliente` int(10) NOT NULL AUTO_INCREMENT,
  `cliente` varchar(100) COLLATE latin1_spanish_ci DEFAULT NULL,
  `contacto` varchar(100) COLLATE latin1_spanish_ci DEFAULT NULL,
  `nif` varchar(15) COLLATE latin1_spanish_ci DEFAULT NULL,
  `correos` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `telefonos` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `direccion` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `cp` varchar(5) COLLATE latin1_spanish_ci DEFAULT NULL,
  `poblacion` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `notas` longtext COLLATE latin1_spanish_ci,
  `fecha_alta` date DEFAULT NULL,
  `fecha_baja` date DEFAULT NULL,
  `id_forma_pago` int(12) DEFAULT NULL,
  `banco` varchar(25) COLLATE latin1_spanish_ci DEFAULT NULL,
  `cuenta_corriente` varchar(25) COLLATE latin1_spanish_ci DEFAULT NULL,
  `clave` varchar(32) COLLATE latin1_spanish_ci DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `web` varchar(100) COLLATE latin1_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `Cliente` (`cliente`),
  UNIQUE KEY `nif` (`nif`),
  KEY `id_forma_pago` (`id_forma_pago`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`id_forma_pago`) REFERENCES `formas_pago` (`id_forma_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=1869979132 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`clientes`
--

/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
LOCK TABLES `clientes` WRITE;
INSERT INTO `acme`.`clientes` VALUES  (1869979130,'Dasis',NULL,'b88876567',NULL,NULL,NULL,NULL,NULL,NULL,'2011-02-22',NULL,NULL,NULL,NULL,NULL,'2011-02-22 17:25:52',NULL),
 (1869979131,'equip80',NULL,'b998776543',NULL,NULL,NULL,NULL,NULL,NULL,'2011-02-22',NULL,NULL,NULL,NULL,NULL,'2011-02-22 17:26:19',NULL);
UNLOCK TABLES;
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;


--
-- Definition of table `acme`.`clientes_contactos`
--

DROP TABLE IF EXISTS `acme`.`clientes_contactos`;
CREATE TABLE  `acme`.`clientes_contactos` (
  `id_contacto` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) DEFAULT NULL,
  `contacto` varchar(50) CHARACTER SET utf8 NOT NULL,
  `telefono` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `correo` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `cargo` varchar(150) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id_contacto`),
  KEY `fk_id_cliente` (`id_cliente`),
  CONSTRAINT `fk_id_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`clientes_contactos`
--

/*!40000 ALTER TABLE `clientes_contactos` DISABLE KEYS */;
LOCK TABLES `clientes_contactos` WRITE;
INSERT INTO `acme`.`clientes_contactos` VALUES  (137,1869979131,'Pep',NULL,'pep@equip80.com',NULL),
 (138,1869979131,'Mar',NULL,'mar@equip80.com',NULL),
 (139,1869979130,'Joan',NULL,'joan@dasis.com',NULL);
UNLOCK TABLES;
/*!40000 ALTER TABLE `clientes_contactos` ENABLE KEYS */;


--
-- Definition of table `acme`.`cursos`
--

DROP TABLE IF EXISTS `acme`.`cursos`;
CREATE TABLE  `acme`.`cursos` (
  `id_curso` varchar(10) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `id_trabajador` varchar(10) COLLATE latin1_spanish_ci DEFAULT NULL,
  `id_grupo` int(10) DEFAULT NULL,
  `curso` varchar(100) COLLATE latin1_spanish_ci NOT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `total_horas` decimal(19,4) DEFAULT '0.0000',
  `precio_hora` decimal(19,4) DEFAULT '0.0000',
  `retencion` decimal(19,4) DEFAULT '0.0000',
  `dilluns` tinyint(1) NOT NULL DEFAULT '0',
  `dimarts` tinyint(1) NOT NULL DEFAULT '0',
  `dimecres` tinyint(1) NOT NULL DEFAULT '0',
  `dijous` tinyint(1) NOT NULL DEFAULT '0',
  `divendres` tinyint(1) NOT NULL DEFAULT '0',
  `dissabte` tinyint(1) NOT NULL DEFAULT '0',
  `diumenge` tinyint(1) NOT NULL DEFAULT '0',
  `notas` longtext COLLATE latin1_spanish_ci,
  `acabado` tinyint(1) NOT NULL DEFAULT '0',
  `liquidado` tinyint(1) NOT NULL DEFAULT '0',
  `facturado` tinyint(1) NOT NULL DEFAULT '0',
  `memoria` tinyint(1) NOT NULL DEFAULT '0',
  `orden` int(10) DEFAULT NULL,
  `filtro` tinyint(1) NOT NULL DEFAULT '0',
  `id_cliente` int(10) DEFAULT NULL,
  `precio_hora_cliente` decimal(19,4) DEFAULT '0.0000',
  `id_tipo_curso` int(10) DEFAULT NULL,
  `num_apuntes` tinyint(3) unsigned DEFAULT NULL,
  `fecha_baja` datetime DEFAULT NULL,
  `iva` decimal(19,4) NOT NULL DEFAULT '0.0000',
  `num_curso` int(11) NOT NULL AUTO_INCREMENT,
  `id_contacto` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_curso`),
  KEY `id_trabajador` (`id_trabajador`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_tipo_curso` (`id_tipo_curso`),
  KEY `id_grupo` (`id_grupo`),
  KEY `num_curso` (`num_curso`),
  KEY `fk_id_contacto` (`id_contacto`),
  CONSTRAINT `cursos_ibfk_1` FOREIGN KEY (`id_trabajador`) REFERENCES `trabajadores` (`id_trabajador`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cursos_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE,
  CONSTRAINT `cursos_ibfk_3` FOREIGN KEY (`id_tipo_curso`) REFERENCES `tipos_curso` (`id_tipo_curso`),
  CONSTRAINT `cursos_ibfk_4` FOREIGN KEY (`id_grupo`) REFERENCES `grupos_cursos` (`id_grupo`),
  CONSTRAINT `fk_id_contacto` FOREIGN KEY (`id_contacto`) REFERENCES `clientes_contactos` (`id_contacto`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=574 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`cursos`
--

/*!40000 ALTER TABLE `cursos` DISABLE KEYS */;
LOCK TABLES `cursos` WRITE;
INSERT INTO `acme`.`cursos` VALUES  ('C-01-11','NANDO',NULL,'Dreamweaver','2011-02-22 17:28:51','2011-02-28','2011-03-28','09:00:00','14:00:00','33.0000','50.0000','0.1500',1,0,1,0,1,0,0,NULL,0,0,0,0,NULL,0,1869979130,'100.0000',NULL,10,NULL,'0.0000',573,NULL);
UNLOCK TABLES;
/*!40000 ALTER TABLE `cursos` ENABLE KEYS */;


--
-- Definition of table `acme`.`cursos_clases`
--

DROP TABLE IF EXISTS `acme`.`cursos_clases`;
CREATE TABLE  `acme`.`cursos_clases` (
  `id_clase` int(10) NOT NULL AUTO_INCREMENT,
  `id_curso` varchar(10) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `duracion` decimal(19,4) DEFAULT NULL,
  `id_materia` varchar(25) COLLATE latin1_spanish_ci DEFAULT NULL,
  `id_trabajador` varchar(10) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `sesion` longtext COLLATE latin1_spanish_ci,
  `num_clase` smallint(5) DEFAULT NULL,
  `total_clases` smallint(5) DEFAULT NULL,
  PRIMARY KEY (`id_curso`,`fecha`,`hora_inicio`,`id_trabajador`),
  UNIQUE KEY `id_clase` (`id_clase`),
  KEY `id_curso` (`id_curso`),
  KEY `id_trabajador` (`id_trabajador`),
  KEY `fecha` (`fecha`),
  CONSTRAINT `cursos_clases_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cursos_clases_ibfk_2` FOREIGN KEY (`id_trabajador`) REFERENCES `trabajadores` (`id_trabajador`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2147254731 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`cursos_clases`
--

/*!40000 ALTER TABLE `cursos_clases` DISABLE KEYS */;
LOCK TABLES `cursos_clases` WRITE;
INSERT INTO `acme`.`cursos_clases` VALUES  (2147254724,'C-01-11','2011-02-28','09:00:00','5.0000','Dreamweaver','NANDO',NULL,1,7),
 (2147254725,'C-01-11','2011-03-02','09:00:00','5.0000','Dreamweaver','NANDO',NULL,2,7),
 (2147254726,'C-01-11','2011-03-04','09:00:00','3.0000','HTML','NANDO',NULL,3,7),
 (2147254727,'C-01-11','2011-03-07','09:00:00','5.0000','HTML','FCO',NULL,4,7),
 (2147254728,'C-01-11','2011-03-09','09:00:00','5.0000','HTML','NANDO',NULL,5,7),
 (2147254729,'C-01-11','2011-03-11','09:00:00','5.0000','HTML','NANDO',NULL,6,7),
 (2147254730,'C-01-11','2011-03-14','09:00:00','5.0000','HTML','NANDO',NULL,7,7);
UNLOCK TABLES;
/*!40000 ALTER TABLE `cursos_clases` ENABLE KEYS */;


--
-- Definition of table `acme`.`cursos_materias`
--

DROP TABLE IF EXISTS `acme`.`cursos_materias`;
CREATE TABLE  `acme`.`cursos_materias` (
  `id_curso_materia` int(10) NOT NULL AUTO_INCREMENT,
  `id_curso` varchar(10) COLLATE latin1_spanish_ci DEFAULT NULL,
  `id_materia` varchar(25) COLLATE latin1_spanish_ci DEFAULT NULL,
  `horas` decimal(19,4) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  PRIMARY KEY (`id_curso_materia`),
  KEY `id_curso` (`id_curso`),
  KEY `id_materia` (`id_materia`),
  CONSTRAINT `cursos_materias_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2146042241 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`cursos_materias`
--

/*!40000 ALTER TABLE `cursos_materias` DISABLE KEYS */;
LOCK TABLES `cursos_materias` WRITE;
INSERT INTO `acme`.`cursos_materias` VALUES  (2146042239,'C-01-11','Dreamweaver','10.0000',NULL),
 (2146042240,'C-01-11','HTML','23.0000',NULL);
UNLOCK TABLES;
/*!40000 ALTER TABLE `cursos_materias` ENABLE KEYS */;


--
-- Definition of table `acme`.`eventos`
--

DROP TABLE IF EXISTS `acme`.`eventos`;
CREATE TABLE  `acme`.`eventos` (
  `id_evento` int(10) NOT NULL AUTO_INCREMENT,
  `evento` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `descripcion` longtext COLLATE latin1_spanish_ci,
  `resultado` longtext COLLATE latin1_spanish_ci,
  `id_usuario` varchar(10) COLLATE latin1_spanish_ci DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `url` varchar(100) COLLATE latin1_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_evento`)
) ENGINE=InnoDB AUTO_INCREMENT=1982219752 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`eventos`
--

/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
LOCK TABLES `eventos` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;


--
-- Definition of table `acme`.`facturas`
--

DROP TABLE IF EXISTS `acme`.`facturas`;
CREATE TABLE  `acme`.`facturas` (
  `num_factura` int(10) NOT NULL AUTO_INCREMENT,
  `id_factura` varchar(10) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `id_curso` varchar(10) COLLATE latin1_spanish_ci DEFAULT NULL,
  `id_cliente` int(10) DEFAULT NULL,
  `id_alumno` int(10) DEFAULT NULL,
  `id_banco` int(10) DEFAULT NULL,
  `id_forma_pago` int(10) DEFAULT NULL,
  `fecha_factura` date DEFAULT NULL,
  `fecha_revisado` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `para` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `horas` decimal(19,4) DEFAULT NULL,
  `precio_hora` decimal(19,4) DEFAULT NULL,
  `subtotal` decimal(19,4) DEFAULT NULL,
  `retencion` decimal(19,4) DEFAULT NULL,
  `iva` decimal(19,4) DEFAULT NULL,
  `encabezado` longtext COLLATE latin1_spanish_ci,
  `detalle` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `pie` longtext COLLATE latin1_spanish_ci,
  `revisado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_creacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_factura`),
  UNIQUE KEY `num_factura` (`num_factura`),
  KEY `id_curso` (`id_curso`),
  KEY `id_alumno` (`id_alumno`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_forma_pago` (`id_forma_pago`),
  KEY `id_banco` (`id_banco`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE,
  CONSTRAINT `facturas_ibfk_3` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE,
  CONSTRAINT `facturas_ibfk_4` FOREIGN KEY (`id_forma_pago`) REFERENCES `formas_pago` (`id_forma_pago`),
  CONSTRAINT `facturas_ibfk_5` FOREIGN KEY (`id_banco`) REFERENCES `bancos` (`id_banco`)
) ENGINE=InnoDB AUTO_INCREMENT=540 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`facturas`
--

/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
LOCK TABLES `facturas` WRITE;
INSERT INTO `acme`.`facturas` VALUES  (539,'D00001-11',NULL,1869979130,NULL,1079599572,9,'2011-02-22',NULL,NULL,NULL,NULL,NULL,NULL,'0.1500','0.0000','',NULL,NULL,-1,'2011-02-22 17:39:27');
UNLOCK TABLES;
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;


--
-- Definition of table `acme`.`facturas_cobros`
--

DROP TABLE IF EXISTS `acme`.`facturas_cobros`;
CREATE TABLE  `acme`.`facturas_cobros` (
  `id_cobro` int(10) NOT NULL AUTO_INCREMENT,
  `id_factura` varchar(10) COLLATE latin1_spanish_ci NOT NULL,
  `vencimiento` date NOT NULL DEFAULT '0000-00-00',
  `importe` decimal(19,4) DEFAULT NULL,
  `cobrado` decimal(19,4) DEFAULT NULL,
  PRIMARY KEY (`id_factura`,`vencimiento`),
  UNIQUE KEY `id_cobro` (`id_cobro`),
  KEY `id_factura` (`id_factura`),
  CONSTRAINT `fk_facturas_cobros` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2064742488 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`facturas_cobros`
--

/*!40000 ALTER TABLE `facturas_cobros` DISABLE KEYS */;
LOCK TABLES `facturas_cobros` WRITE;
INSERT INTO `acme`.`facturas_cobros` VALUES  (2064742485,'D00001-11','2011-02-28','700.0000','700.0000'),
 (2064742487,'D00001-11','2011-03-30','1000.0000','0.0000');
UNLOCK TABLES;
/*!40000 ALTER TABLE `facturas_cobros` ENABLE KEYS */;


--
-- Definition of table `acme`.`facturas_cursos`
--

DROP TABLE IF EXISTS `acme`.`facturas_cursos`;
CREATE TABLE  `acme`.`facturas_cursos` (
  `id_factura_curso` int(11) NOT NULL AUTO_INCREMENT,
  `id_factura` varchar(10) COLLATE latin1_spanish_ci NOT NULL,
  `id_curso` varchar(10) COLLATE latin1_spanish_ci NOT NULL,
  `detalle` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `horas` decimal(19,4) DEFAULT NULL,
  `precio_hora` decimal(19,4) DEFAULT NULL,
  `subtotal` decimal(19,4) DEFAULT NULL,
  PRIMARY KEY (`id_factura_curso`),
  KEY `id_factura` (`id_factura`),
  KEY `id_curso` (`id_curso`),
  CONSTRAINT `fk_id_curso` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_id_factura` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2558 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `acme`.`facturas_cursos`
--

/*!40000 ALTER TABLE `facturas_cursos` DISABLE KEYS */;
LOCK TABLES `facturas_cursos` WRITE;
INSERT INTO `acme`.`facturas_cursos` VALUES  (2557,'D00001-11','C-01-11','Dreamweaver','34.0000','50.0000','1700.0000');
UNLOCK TABLES;
/*!40000 ALTER TABLE `facturas_cursos` ENABLE KEYS */;


--
-- Definition of table `acme`.`festivos`
--

DROP TABLE IF EXISTS `acme`.`festivos`;
CREATE TABLE  `acme`.`festivos` (
  `fecha` date NOT NULL DEFAULT '0000-00-00',
  `fecha_fin` date DEFAULT NULL,
  `aniversario` tinyint(1) NOT NULL DEFAULT '0',
  `descripcion` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=538 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`festivos`
--

/*!40000 ALTER TABLE `festivos` DISABLE KEYS */;
LOCK TABLES `festivos` WRITE;
INSERT INTO `acme`.`festivos` VALUES  ('1996-01-01',NULL,-1,'Año Nuevo',1),
 ('1996-01-06',NULL,-1,'Reyes',2),
 ('1996-04-05',NULL,0,'Viernes Santo',3),
 ('1996-04-08',NULL,0,'Lunes de Pascua Florida',4),
 ('1996-05-01',NULL,-1,'Fiesta del Trabajo',5),
 ('1996-05-27',NULL,0,'Lunes de Pascua Granada',6),
 ('1996-06-24',NULL,-1,'Sant Juan',7),
 ('1996-08-15',NULL,-1,'La Asunción',8),
 ('1996-09-11',NULL,-1,'Diada Nacional de Catalunya',9),
 ('1996-09-24',NULL,0,'Fiesta de la Mercè',10),
 ('1996-10-12',NULL,-1,'Fiesta de la Hispanidad',11),
 ('1996-11-01',NULL,-1,'Todos los Santos',12),
 ('1996-12-06',NULL,-1,'Día de la Constitución',13),
 ('1996-12-25',NULL,-1,'Navidad',14),
 ('1996-12-26',NULL,-1,'San Esteban',15),
 ('1997-01-01',NULL,0,'Año nuevo',16),
 ('1997-01-06',NULL,0,'Reyes',17),
 ('1997-03-28',NULL,0,'Viernes Santo',18),
 ('1997-03-31',NULL,0,'Lunes de Pascua Florida',19),
 ('1997-05-01',NULL,0,'Fiesta del Trabajo',20),
 ('1997-05-19',NULL,0,'Lunes de Pascua Granada',21),
 ('1997-06-24',NULL,0,'San Juan',22),
 ('1997-08-15',NULL,0,'La Asunción',23),
 ('1997-09-11',NULL,0,'Diada Nacional de Cataluña',24),
 ('1997-09-24',NULL,0,'Fiesta de la Mercè',25),
 ('1997-10-12',NULL,0,'Fiesta de la Hispanidad',26),
 ('1997-11-01',NULL,0,'Todos los Santos',27),
 ('1997-12-06',NULL,0,'Día de la Constitución',28),
 ('1997-12-08',NULL,0,'Fiesta',29),
 ('1997-12-25',NULL,0,'Navidad',30),
 ('1997-12-26',NULL,0,'San Esteban',31),
 ('1998-03-03',NULL,0,'Semana santa',32),
 ('1998-04-07',NULL,0,'Semana santa',33),
 ('1998-04-09',NULL,0,'Semana santa',34),
 ('1998-05-01',NULL,0,'Día del Trabajo',35),
 ('1998-06-24',NULL,0,'Sant Juan',36),
 ('1998-06-29',NULL,0,'San Pere',37),
 ('1998-08-15',NULL,0,'Asunción',38),
 ('1998-09-11',NULL,0,'La diada',39),
 ('1998-09-24',NULL,0,'Mercè',40),
 ('1998-09-25',NULL,0,'Puente Mercè',41),
 ('1998-10-12',NULL,0,'Hispanidad',42),
 ('1998-12-08',NULL,0,'Immaculada',43),
 ('1998-12-25',NULL,0,'Navidad',44),
 ('1998-12-26',NULL,0,'San Esteban',45),
 ('1999-09-24',NULL,0,'La Merçè',46),
 ('2002-03-25',NULL,0,'Semana Santa',47),
 ('2002-03-26',NULL,0,'Semana Santa',48),
 ('2002-03-27',NULL,0,'Semana Santa',49),
 ('2002-03-28',NULL,0,'Semana Santa',50),
 ('2002-03-29',NULL,0,'Semana Santa',51),
 ('2002-04-01',NULL,0,'Semana Santa',52),
 ('2002-05-01',NULL,0,'Día del Trabajo',53),
 ('2002-05-20',NULL,0,'Segunda Pascua',54),
 ('2002-06-24',NULL,0,'San Juan',55),
 ('2002-09-11',NULL,0,'La Diada',56),
 ('2002-12-23',NULL,0,'fiesta program',57),
 ('2002-12-24',NULL,0,'fiesta program',58),
 ('2002-12-25',NULL,0,'Navidad',59),
 ('2002-12-26',NULL,0,'San Esteban',60),
 ('2002-12-27',NULL,0,'fiesta program',61),
 ('2002-12-30',NULL,0,'fiesta program',62),
 ('2002-12-31',NULL,0,'fiesta program',63),
 ('2003-01-01',NULL,0,'Año Nuevo',64),
 ('2003-01-02',NULL,0,'fiesta program',65),
 ('2003-01-03',NULL,0,'fiesta program',66),
 ('2003-01-06',NULL,0,'fiesta program',67),
 ('2003-01-07',NULL,0,'fiesta program',68),
 ('2003-03-03',NULL,0,'San Medir',69),
 ('2003-04-12',NULL,0,'Semana Santa',70),
 ('2003-04-14',NULL,0,'Semana Santa',71),
 ('2003-04-15',NULL,0,'Semana Santa',72),
 ('2003-04-16',NULL,0,'Semana Santa',73),
 ('2003-04-17',NULL,0,'Semana Santa',74),
 ('2003-04-18',NULL,0,'Viernes Santo',75),
 ('2003-04-19',NULL,0,'Sábado Santo',76),
 ('2003-04-21',NULL,0,'Lunes de Pascua',77),
 ('2003-05-01',NULL,0,'Fiesta del Trabajo',78),
 ('2003-06-09',NULL,0,'Segona Pasqua',79),
 ('2003-06-24',NULL,0,'San Joan',80),
 ('2003-12-08',NULL,0,'La Inmaculada',81),
 ('2003-12-25',NULL,0,'Navidad',82),
 ('2003-12-26',NULL,0,'San Esteban',83),
 ('2004-01-01',NULL,0,'Año Nuevo',84),
 ('2004-01-06',NULL,0,'Reyes',85),
 ('2004-12-13',NULL,0,'Santa Lucía',86),
 ('2004-12-14',NULL,0,'Puente',87),
 ('2004-12-15',NULL,0,'Fiesta de la Hispanidad',88),
 ('2004-12-24',NULL,0,'navidad, vísperas noche buena',89),
 ('2004-12-27',NULL,0,'navidad',90),
 ('2004-12-28',NULL,0,'navidad, inocentes',91),
 ('2004-12-29',NULL,0,'navidad',92),
 ('2004-12-30',NULL,0,'navidad',93),
 ('2004-12-31',NULL,0,'navidad',94),
 ('2005-01-03',NULL,0,'navidad',95),
 ('2005-01-04',NULL,0,'navidad',96),
 ('2005-01-05',NULL,0,'navidad',97),
 ('2005-01-06',NULL,0,'navidad, Reyes',98),
 ('2005-01-07',NULL,0,'navidad',99),
 ('2005-09-23',NULL,0,'Mercè',100),
 ('2005-10-12',NULL,0,'Hispanidad',101),
 ('2005-10-31',NULL,0,'puente',102),
 ('2005-11-01',NULL,0,'Todos los santos.',103),
 ('2005-12-06',NULL,0,'Dia de la Constitución',104),
 ('2005-12-08',NULL,0,'La Inmaculada',105),
 ('2005-12-26',NULL,0,'San Esteve',106),
 ('2006-01-06',NULL,0,'Reyes',107),
 ('2006-04-10',NULL,0,'Semana santa',108),
 ('2006-04-11',NULL,0,'Semana santa',109),
 ('2006-04-12',NULL,0,'Semana santa',110),
 ('2006-04-13',NULL,0,'Semana santa',111),
 ('2006-04-14',NULL,0,'Viernes santo',112),
 ('2006-04-17',NULL,0,'Lunes de Pascua Florida o Resurrección',113),
 ('2006-05-01',NULL,0,'Día del trabajo',114),
 ('2006-06-05',NULL,0,'Segunda Pascua',115),
 ('2006-06-24',NULL,0,'Sant Joan',116),
 ('2006-08-15',NULL,0,'La Asunción',117),
 ('2006-09-11',NULL,0,'Diada nacional de Catalunya',118),
 ('2006-09-25',NULL,0,'Festa de la Mercè',119),
 ('2006-10-12',NULL,0,'Fiesta de la Hispanidad',120),
 ('2006-11-01',NULL,0,'Todos los santos',121),
 ('2006-12-06',NULL,0,'Día de la Constitución',122),
 ('2006-12-08',NULL,0,'La Inmaculada',123),
 ('2006-12-25',NULL,0,'Navidad',124),
 ('2006-12-26',NULL,0,'Sant Esteve',125),
 ('2007-04-01',NULL,0,'Semana santa',126),
 ('2007-04-02',NULL,0,'Semana santa',127),
 ('2007-04-03',NULL,0,'Semana santa',128),
 ('2007-04-04',NULL,0,'Semana santa',129),
 ('2007-04-05',NULL,0,'Semana santa',130),
 ('2007-04-06',NULL,0,'Semana santa',131),
 ('2007-04-07',NULL,0,'Semana santa',132),
 ('2007-04-08',NULL,0,'Semana santa',133),
 ('2007-04-17',NULL,0,'Dilluns de Pasqua Florida',134),
 ('2007-06-04',NULL,0,'segona Pasqua',135),
 ('2007-06-24',NULL,0,'Sant Joan',136),
 ('2007-09-11',NULL,0,'Diada Nacional',137),
 ('2007-10-12',NULL,0,'Festa de la Hispanitat',138),
 ('2007-11-01',NULL,0,'Tots Sants',139),
 ('2007-11-02',NULL,0,'Puente todos los santos',140),
 ('2007-12-06',NULL,0,'Dia de la Constitució',141),
 ('2007-12-07',NULL,0,'Puente día constitución',142),
 ('2007-12-08',NULL,0,'La Inmaculada',143),
 ('2007-12-25',NULL,0,'Nadal',144),
 ('2007-12-26',NULL,0,'Sant Esteve',145),
 ('2008-01-01',NULL,0,'Fin de año (Estatal)',146),
 ('2008-03-14',NULL,0,'Prox. Semana Santa',147),
 ('2008-03-16',NULL,0,'Semana santa',148),
 ('2008-03-17',NULL,0,'Semana santa',149),
 ('2008-03-18',NULL,0,'Semana santa',150),
 ('2008-03-19',NULL,0,'Semana santa',151),
 ('2008-03-20',NULL,0,'Semana santa',152),
 ('2008-03-21',NULL,0,'Semana santa (Viernes Santo)',153),
 ('2008-03-22',NULL,0,'Semana santa X',154),
 ('2008-03-23',NULL,0,'Semana santa',155),
 ('2008-03-24',NULL,0,'Pascua Florida (Cataluña)',156),
 ('2008-05-12',NULL,0,'Segunda Páscua',157),
 ('2008-06-24',NULL,0,'San Juan (Cataluña)',158),
 ('2008-08-15',NULL,0,'La Asunción (Estatal)',159),
 ('2008-09-11',NULL,0,'Festividad Nacional de Cataluña',160),
 ('2008-09-24',NULL,0,'Día de la Mercè (Barcelona)',161),
 ('2008-11-01',NULL,0,'Todos los Santos (Estatal)',162),
 ('2008-12-06',NULL,0,'Día de la Constitución (Estatal)',163),
 ('2008-12-08',NULL,0,'Día de la Inmaculada Concepción (Estatal)',164),
 ('2008-12-25',NULL,0,'Navidad (Estatal)',165),
 ('2008-12-26',NULL,0,'San Esteban (Cataluña)',166),
 ('2009-04-05',NULL,0,'Semana santa',167),
 ('2009-04-06',NULL,0,'Semana santa',168),
 ('2009-04-07',NULL,0,'Semana santa',169),
 ('2009-04-08',NULL,0,'Semana santa',170),
 ('2009-04-09',NULL,0,'Semana santa',171),
 ('2009-04-10',NULL,0,'Semana santa',172),
 ('2009-04-11',NULL,0,'Semana santa',173),
 ('2009-04-12',NULL,0,'Semana santa',174),
 ('2009-05-01',NULL,0,'Día del trabajo',175),
 ('2009-06-24',NULL,0,'Sant Joan',176),
 ('2010-03-28',NULL,0,'Semana santa (domingo)',177),
 ('2010-03-29',NULL,0,'Semana santa',178),
 ('2010-03-30',NULL,0,'Semana santa',179),
 ('2010-03-31',NULL,0,'Semana santa',180),
 ('2010-04-01',NULL,0,'Semana santa',181),
 ('2010-04-02',NULL,0,'Semana santa',182),
 ('2010-04-03',NULL,0,'Semana santa',183),
 ('2010-04-04',NULL,0,'Semana santa',184),
 ('2011-04-17',NULL,0,'Semana santa',185),
 ('2011-04-18',NULL,0,'Semana santa',186),
 ('2011-04-19',NULL,0,'Semana santa',187),
 ('2011-04-20',NULL,0,'Semana santa',188),
 ('2011-04-21',NULL,0,'Semana santa',189),
 ('2011-04-22',NULL,0,'Semana santa',190),
 ('2011-04-23',NULL,0,'Semana santa',191),
 ('2011-04-24',NULL,0,'Semana santa',192),
 ('2012-04-01',NULL,0,'Semana santa',193),
 ('2012-04-02',NULL,0,'Semana santa',194),
 ('2012-04-03',NULL,0,'Semana santa',195),
 ('2012-04-04',NULL,0,'Semana santa',196),
 ('2012-04-05',NULL,0,'Semana santa',197),
 ('2012-04-06',NULL,0,'Semana santa',198),
 ('2012-04-07',NULL,0,'Semana santa',199),
 ('2012-04-08',NULL,0,'Semana santa',200),
 ('2013-03-24',NULL,0,'Semana santa',201),
 ('2013-03-25',NULL,0,'Semana santa',202),
 ('2013-03-26',NULL,0,'Semana santa',203),
 ('2013-03-27',NULL,0,'Semana santa',204),
 ('2013-03-28',NULL,0,'Semana santa',205),
 ('2013-03-29',NULL,0,'Semana santa',206),
 ('2013-03-30',NULL,0,'Semana santa',207),
 ('2013-03-31',NULL,0,'Semana santa',208),
 ('2014-04-13',NULL,0,'Semana santa',209),
 ('2014-04-14',NULL,0,'Semana santa',210),
 ('2014-04-15',NULL,0,'Semana santa',211),
 ('2014-04-16',NULL,0,'Semana santa',212),
 ('2014-04-17',NULL,0,'Semana santa',213),
 ('2014-04-18',NULL,0,'Semana santa',214),
 ('2014-04-19',NULL,0,'Semana santa',215),
 ('2014-04-20',NULL,0,'Semana santa',216),
 ('2015-03-29',NULL,0,'Semana santa',217),
 ('2015-03-30',NULL,0,'Semana santa',218),
 ('2015-03-31',NULL,0,'Semana santa',219),
 ('2015-04-01',NULL,0,'Semana santa',220),
 ('2015-04-02',NULL,0,'Semana santa',221),
 ('2015-04-03',NULL,0,'Semana santa',222),
 ('2015-04-04',NULL,0,'Semana santa',223),
 ('2015-04-05',NULL,0,'Semana santa',224),
 ('2016-03-20',NULL,0,'Semana santa',225),
 ('2016-03-21',NULL,0,'Semana santa',226),
 ('2016-03-22',NULL,0,'Semana santa',227),
 ('2016-03-23',NULL,0,'Semana santa',228),
 ('2016-03-24',NULL,0,'Semana santa',229),
 ('2016-03-25',NULL,0,'Semana santa',230),
 ('2016-03-26',NULL,0,'Semana santa',231),
 ('2016-03-27',NULL,0,'Semana santa',232),
 ('2017-04-09',NULL,0,'Semana santa',233),
 ('2017-04-10',NULL,0,'Semana santa',234),
 ('2017-04-11',NULL,0,'Semana santa',235),
 ('2017-04-12',NULL,0,'Semana santa',236),
 ('2017-04-13',NULL,0,'Semana santa',237),
 ('2017-04-14',NULL,0,'Semana santa',238),
 ('2017-04-15',NULL,0,'Semana santa',239),
 ('2017-04-16',NULL,0,'Semana santa',240),
 ('2018-03-25',NULL,0,'Semana santa',241),
 ('2018-03-26',NULL,0,'Semana santa',242),
 ('2018-03-27',NULL,0,'Semana santa',243),
 ('2018-03-28',NULL,0,'Semana santa',244),
 ('2018-03-29',NULL,0,'Semana santa',245),
 ('2018-03-30',NULL,0,'Semana santa',246),
 ('2018-03-31',NULL,0,'Semana santa',247),
 ('2018-04-01',NULL,0,'Semana santa',248),
 ('2019-04-14',NULL,0,'Semana santa',249),
 ('2019-04-15',NULL,0,'Semana santa',250),
 ('2019-04-16',NULL,0,'Semana santa',251),
 ('2019-04-17',NULL,0,'Semana santa',252),
 ('2019-04-18',NULL,0,'Semana santa',253),
 ('2019-04-19',NULL,0,'Semana santa',254),
 ('2019-04-20',NULL,0,'Semana santa',255),
 ('2019-04-21',NULL,0,'Semana santa',256),
 ('2020-04-05',NULL,0,'Semana santa',257),
 ('2020-04-06',NULL,0,'Semana santa',258),
 ('2020-04-07',NULL,0,'Semana santa',259),
 ('2020-04-08',NULL,0,'Semana santa',260),
 ('2020-04-09',NULL,0,'Semana santa',261),
 ('2020-04-10',NULL,0,'Semana santa',262),
 ('2020-04-11',NULL,0,'Semana santa',263),
 ('2020-04-12',NULL,0,'Semana santa',264),
 ('2021-03-28',NULL,0,'Semana santa',265),
 ('2021-03-29',NULL,0,'Semana santa',266),
 ('2021-03-30',NULL,0,'Semana santa',267),
 ('2021-03-31',NULL,0,'Semana santa',268),
 ('2021-04-01',NULL,0,'Semana santa',269),
 ('2021-04-02',NULL,0,'Semana santa',270),
 ('2021-04-03',NULL,0,'Semana santa',271),
 ('2021-04-04',NULL,0,'Semana santa',272),
 ('2022-04-10',NULL,0,'Semana santa',273),
 ('2022-04-11',NULL,0,'Semana santa',274),
 ('2022-04-12',NULL,0,'Semana santa',275),
 ('2022-04-13',NULL,0,'Semana santa',276),
 ('2022-04-14',NULL,0,'Semana santa',277),
 ('2022-04-15',NULL,0,'Semana santa',278),
 ('2022-04-16',NULL,0,'Semana santa',279),
 ('2022-04-17',NULL,0,'Semana santa',280),
 ('2023-04-02',NULL,0,'Semana santa',281),
 ('2023-04-03',NULL,0,'Semana santa',282),
 ('2023-04-04',NULL,0,'Semana santa',283),
 ('2023-04-05',NULL,0,'Semana santa',284),
 ('2023-04-06',NULL,0,'Semana santa',285),
 ('2023-04-07',NULL,0,'Semana santa',286),
 ('2023-04-08',NULL,0,'Semana santa',287),
 ('2023-04-09',NULL,0,'Semana santa',288),
 ('2024-03-24',NULL,0,'Semana santa',289),
 ('2024-03-25',NULL,0,'Semana santa',290),
 ('2024-03-26',NULL,0,'Semana santa',291),
 ('2024-03-27',NULL,0,'Semana santa',292),
 ('2024-03-28',NULL,0,'Semana santa',293),
 ('2024-03-29',NULL,0,'Semana santa',294),
 ('2024-03-30',NULL,0,'Semana santa',295),
 ('2024-03-31',NULL,0,'Semana santa',296),
 ('2025-04-13',NULL,0,'Semana santa',297),
 ('2025-04-14',NULL,0,'Semana santa',298),
 ('2025-04-15',NULL,0,'Semana santa',299),
 ('2025-04-16',NULL,0,'Semana santa',300),
 ('2025-04-17',NULL,0,'Semana santa',301),
 ('2025-04-18',NULL,0,'Semana santa',302),
 ('2025-04-19',NULL,0,'Semana santa',303),
 ('2025-04-20',NULL,0,'Semana santa',304),
 ('2026-03-29',NULL,0,'Semana santa',305),
 ('2026-03-30',NULL,0,'Semana santa',306),
 ('2026-03-31',NULL,0,'Semana santa',307),
 ('2026-04-01',NULL,0,'Semana santa',308),
 ('2026-04-02',NULL,0,'Semana santa',309),
 ('2026-04-03',NULL,0,'Semana santa',310),
 ('2026-04-04',NULL,0,'Semana santa',311),
 ('2026-04-05',NULL,0,'Semana santa',312),
 ('2027-03-21',NULL,0,'Semana santa',313),
 ('2027-03-22',NULL,0,'Semana santa',314),
 ('2027-03-23',NULL,0,'Semana santa',315),
 ('2027-03-24',NULL,0,'Semana santa',316),
 ('2027-03-25',NULL,0,'Semana santa',317),
 ('2027-03-26',NULL,0,'Semana santa',318),
 ('2027-03-27',NULL,0,'Semana santa',319),
 ('2027-03-28',NULL,0,'Semana santa',320),
 ('2028-04-09',NULL,0,'Semana santa',321),
 ('2028-04-10',NULL,0,'Semana santa',322),
 ('2028-04-11',NULL,0,'Semana santa',323),
 ('2028-04-12',NULL,0,'Semana santa',324),
 ('2028-04-13',NULL,0,'Semana santa',325),
 ('2028-04-14',NULL,0,'Semana santa',326),
 ('2028-04-15',NULL,0,'Semana santa',327),
 ('2028-04-16',NULL,0,'Semana santa',328),
 ('2029-03-25',NULL,0,'Semana santa',329),
 ('2029-03-26',NULL,0,'Semana santa',330),
 ('2029-03-27',NULL,0,'Semana santa',331),
 ('2029-03-28',NULL,0,'Semana santa',332),
 ('2029-03-29',NULL,0,'Semana santa',333),
 ('2029-03-30',NULL,0,'Semana santa',334),
 ('2029-03-31',NULL,0,'Semana santa',335),
 ('2029-04-01',NULL,0,'Semana santa',336),
 ('2030-04-14',NULL,0,'Semana santa',337),
 ('2030-04-15',NULL,0,'Semana santa',338),
 ('2030-04-16',NULL,0,'Semana santa',339),
 ('2030-04-17',NULL,0,'Semana santa',340),
 ('2030-04-18',NULL,0,'Semana santa',341),
 ('2030-04-19',NULL,0,'Semana santa',342),
 ('2030-04-20',NULL,0,'Semana santa',343),
 ('2030-04-21',NULL,0,'Semana santa',344),
 ('2031-04-06',NULL,0,'Semana santa',345),
 ('2031-04-07',NULL,0,'Semana santa',346),
 ('2031-04-08',NULL,0,'Semana santa',347),
 ('2031-04-09',NULL,0,'Semana santa',348),
 ('2031-04-10',NULL,0,'Semana santa',349),
 ('2031-04-11',NULL,0,'Semana santa',350),
 ('2031-04-12',NULL,0,'Semana santa',351),
 ('2031-04-13',NULL,0,'Semana santa',352),
 ('2032-03-21',NULL,0,'Semana santa',353),
 ('2032-03-22',NULL,0,'Semana santa',354),
 ('2032-03-23',NULL,0,'Semana santa',355),
 ('2032-03-24',NULL,0,'Semana santa',356),
 ('2032-03-25',NULL,0,'Semana santa',357),
 ('2032-03-26',NULL,0,'Semana santa',358),
 ('2032-03-27',NULL,0,'Semana santa',359),
 ('2032-03-28',NULL,0,'Semana santa',360),
 ('2033-04-10',NULL,0,'Semana santa',361),
 ('2033-04-11',NULL,0,'Semana santa',362),
 ('2033-04-12',NULL,0,'Semana santa',363),
 ('2033-04-13',NULL,0,'Semana santa',364),
 ('2033-04-14',NULL,0,'Semana santa',365),
 ('2033-04-15',NULL,0,'Semana santa',366),
 ('2033-04-16',NULL,0,'Semana santa',367),
 ('2033-04-17',NULL,0,'Semana santa',368),
 ('2034-04-02',NULL,0,'Semana santa',369),
 ('2034-04-03',NULL,0,'Semana santa',370),
 ('2034-04-04',NULL,0,'Semana santa',371),
 ('2034-04-05',NULL,0,'Semana santa',372),
 ('2034-04-06',NULL,0,'Semana santa',373),
 ('2034-04-07',NULL,0,'Semana santa',374),
 ('2034-04-08',NULL,0,'Semana santa',375),
 ('2034-04-09',NULL,0,'Semana santa',376),
 ('2035-03-18',NULL,0,'Semana santa',377),
 ('2035-03-19',NULL,0,'Semana santa',378),
 ('2035-03-20',NULL,0,'Semana santa',379),
 ('2035-03-21',NULL,0,'Semana santa',380),
 ('2035-03-22',NULL,0,'Semana santa',381),
 ('2035-03-23',NULL,0,'Semana santa',382),
 ('2035-03-24',NULL,0,'Semana santa',383),
 ('2035-03-25',NULL,0,'Semana santa',384),
 ('2036-04-06',NULL,0,'Semana santa',385),
 ('2036-04-07',NULL,0,'Semana santa',386),
 ('2036-04-08',NULL,0,'Semana santa',387),
 ('2036-04-09',NULL,0,'Semana santa',388),
 ('2036-04-10',NULL,0,'Semana santa',389),
 ('2036-04-11',NULL,0,'Semana santa',390),
 ('2036-04-12',NULL,0,'Semana santa',391),
 ('2036-04-13',NULL,0,'Semana santa',392),
 ('2037-03-29',NULL,0,'Semana santa',393),
 ('2037-03-30',NULL,0,'Semana santa',394),
 ('2037-03-31',NULL,0,'Semana santa',395),
 ('2037-04-01',NULL,0,'Semana santa',396),
 ('2037-04-02',NULL,0,'Semana santa',397),
 ('2037-04-03',NULL,0,'Semana santa',398),
 ('2037-04-04',NULL,0,'Semana santa',399),
 ('2037-04-05',NULL,0,'Semana santa',400),
 ('2038-04-18',NULL,0,'Semana santa',401),
 ('2038-04-19',NULL,0,'Semana santa',402),
 ('2038-04-20',NULL,0,'Semana santa',403),
 ('2038-04-21',NULL,0,'Semana santa',404),
 ('2038-04-22',NULL,0,'Semana santa',405),
 ('2038-04-23',NULL,0,'Semana santa',406),
 ('2038-04-24',NULL,0,'Semana santa',407),
 ('2038-04-25',NULL,0,'Semana santa',408),
 ('2039-04-03',NULL,0,'Semana santa',409),
 ('2039-04-04',NULL,0,'Semana santa',410),
 ('2039-04-05',NULL,0,'Semana santa',411),
 ('2039-04-06',NULL,0,'Semana santa',412),
 ('2039-04-07',NULL,0,'Semana santa',413),
 ('2039-04-08',NULL,0,'Semana santa',414),
 ('2039-04-09',NULL,0,'Semana santa',415),
 ('2039-04-10',NULL,0,'Semana santa',416),
 ('2040-03-25',NULL,0,'Semana santa',417),
 ('2040-03-26',NULL,0,'Semana santa',418),
 ('2040-03-27',NULL,0,'Semana santa',419),
 ('2040-03-28',NULL,0,'Semana santa',420),
 ('2040-03-29',NULL,0,'Semana santa',421),
 ('2040-03-30',NULL,0,'Semana santa',422),
 ('2040-03-31',NULL,0,'Semana santa',423),
 ('2040-04-01',NULL,0,'Semana santa',424),
 ('2041-04-14',NULL,0,'Semana santa',425),
 ('2041-04-15',NULL,0,'Semana santa',426),
 ('2041-04-16',NULL,0,'Semana santa',427),
 ('2041-04-17',NULL,0,'Semana santa',428),
 ('2041-04-18',NULL,0,'Semana santa',429),
 ('2041-04-19',NULL,0,'Semana santa',430),
 ('2041-04-20',NULL,0,'Semana santa',431),
 ('2041-04-21',NULL,0,'Semana santa',432),
 ('2042-03-30',NULL,0,'Semana santa',433),
 ('2042-03-31',NULL,0,'Semana santa',434),
 ('2042-04-01',NULL,0,'Semana santa',435),
 ('2042-04-02',NULL,0,'Semana santa',436),
 ('2042-04-03',NULL,0,'Semana santa',437),
 ('2042-04-04',NULL,0,'Semana santa',438),
 ('2042-04-05',NULL,0,'Semana santa',439),
 ('2042-04-06',NULL,0,'Semana santa',440),
 ('2043-03-22',NULL,0,'Semana santa',441),
 ('2043-03-23',NULL,0,'Semana santa',442),
 ('2043-03-24',NULL,0,'Semana santa',443),
 ('2043-03-25',NULL,0,'Semana santa',444),
 ('2043-03-26',NULL,0,'Semana santa',445),
 ('2043-03-27',NULL,0,'Semana santa',446),
 ('2043-03-28',NULL,0,'Semana santa',447),
 ('2043-03-29',NULL,0,'Semana santa',448),
 ('2044-04-10',NULL,0,'Semana santa',449),
 ('2044-04-11',NULL,0,'Semana santa',450),
 ('2044-04-12',NULL,0,'Semana santa',451),
 ('2044-04-13',NULL,0,'Semana santa',452),
 ('2044-04-14',NULL,0,'Semana santa',453),
 ('2044-04-15',NULL,0,'Semana santa',454),
 ('2044-04-16',NULL,0,'Semana santa',455),
 ('2044-04-17',NULL,0,'Semana santa',456),
 ('2045-04-02',NULL,0,'Semana santa',457),
 ('2045-04-03',NULL,0,'Semana santa',458),
 ('2045-04-04',NULL,0,'Semana santa',459),
 ('2045-04-05',NULL,0,'Semana santa',460),
 ('2045-04-06',NULL,0,'Semana santa',461),
 ('2045-04-07',NULL,0,'Semana santa',462),
 ('2045-04-08',NULL,0,'Semana santa',463),
 ('2045-04-09',NULL,0,'Semana santa',464),
 ('2046-03-18',NULL,0,'Semana santa',465),
 ('2046-03-19',NULL,0,'Semana santa',466),
 ('2046-03-20',NULL,0,'Semana santa',467),
 ('2046-03-21',NULL,0,'Semana santa',468),
 ('2046-03-22',NULL,0,'Semana santa',469),
 ('2046-03-23',NULL,0,'Semana santa',470),
 ('2046-03-24',NULL,0,'Semana santa',471),
 ('2046-03-25',NULL,0,'Semana santa',472),
 ('2047-04-07',NULL,0,'Semana santa',473),
 ('2047-04-08',NULL,0,'Semana santa',474),
 ('2047-04-09',NULL,0,'Semana santa',475),
 ('2047-04-10',NULL,0,'Semana santa',476),
 ('2047-04-11',NULL,0,'Semana santa',477),
 ('2047-04-12',NULL,0,'Semana santa',478),
 ('2047-04-13',NULL,0,'Semana santa',479),
 ('2047-04-14',NULL,0,'Semana santa',480),
 ('2048-03-29',NULL,0,'Semana santa',481),
 ('2048-03-30',NULL,0,'Semana santa',482),
 ('2048-03-31',NULL,0,'Semana santa',483),
 ('2048-04-01',NULL,0,'Semana santa',484),
 ('2048-04-02',NULL,0,'Semana santa',485),
 ('2048-04-03',NULL,0,'Semana santa',486),
 ('2048-04-04',NULL,0,'Semana santa',487),
 ('2048-04-05',NULL,0,'Semana santa',488),
 ('2049-04-11',NULL,0,'Semana santa',489),
 ('2049-04-12',NULL,0,'Semana santa',490),
 ('2049-04-13',NULL,0,'Semana santa',491),
 ('2049-04-14',NULL,0,'Semana santa',492),
 ('2049-04-15',NULL,0,'Semana santa',493),
 ('2049-04-16',NULL,0,'Semana santa',494),
 ('2049-04-17',NULL,0,'Semana santa',495),
 ('2049-04-18',NULL,0,'Semana santa',496),
 ('2050-04-03',NULL,0,'Semana santa',497),
 ('2050-04-04',NULL,0,'Semana santa',498),
 ('2050-04-05',NULL,0,'Semana santa',499),
 ('2050-04-06',NULL,0,'Semana santa',500),
 ('2050-04-07',NULL,0,'Semana santa',501),
 ('2050-04-08',NULL,0,'Semana santa',502),
 ('2050-04-09',NULL,0,'Semana santa',503),
 ('2050-04-10',NULL,0,'Semana santa',504),
 ('1973-05-17',NULL,-1,'Cumpleaños de Eva',505),
 ('2000-08-01','2000-08-31',-1,'Vacaciones de agosto',506),
 ('1967-05-01',NULL,-1,'Cumpleaños de Fco',507),
 ('2009-01-01',NULL,0,'Fin de año',509),
 ('2009-01-06',NULL,0,'Reyes',510),
 ('2009-04-10',NULL,0,'Viernes Santo',511),
 ('2009-04-13',NULL,0,'Pascua Florida o de Resurrección',512),
 ('2009-05-01',NULL,0,'Fiesta del Trabajo',513),
 ('2009-06-01',NULL,0,'Segunda Pascua (Barcelona)',514),
 ('2009-08-15',NULL,0,'La Asunción',515),
 ('2009-09-11',NULL,0,'Festividad Nacional de Cataluña',516),
 ('2009-09-24',NULL,0,'Día de la Mercè (Barcelona)',517),
 ('2009-10-12',NULL,0,'Fiesta Nacional de España',518),
 ('2009-12-08',NULL,0,'Día de la Inmaculada Concepción',519),
 ('2009-12-25',NULL,0,'Navidad',520),
 ('2009-12-26',NULL,0,'San Esteban',521),
 ('2010-01-01',NULL,0,'Año Nuevo',522),
 ('2010-01-06',NULL,0,'Reyes',523),
 ('2010-04-02',NULL,0,'Viernes Santo',524),
 ('2010-04-05',NULL,0,'Lunes de Pascua Florida o de Resurrección',525),
 ('2010-05-01',NULL,0,'Fiesta del Trabajo',526),
 ('2010-05-24',NULL,0,'Lunes de Pascua Granada o Segunda Pascua (Bcn)',527),
 ('2010-06-24',NULL,0,'San Juan',528),
 ('2010-08-15',NULL,0,'La Asunción',529),
 ('2010-09-11',NULL,0,'Festividad Nacional de Cataluña',530),
 ('2010-09-24',NULL,0,'La Mercè (Barcelona)',531),
 ('2010-10-12',NULL,0,'Fiesta de la Hispanidad',532),
 ('2010-11-01',NULL,0,'Fiesta de Todos los Santos',533),
 ('2010-12-06',NULL,0,'Día de la Constitución',534),
 ('2010-12-08',NULL,0,'La Inmaculada',535),
 ('2010-12-25',NULL,0,'Día de Navidad',536),
 ('2010-12-26',NULL,0,'San Esteban',537);
UNLOCK TABLES;
/*!40000 ALTER TABLE `festivos` ENABLE KEYS */;


--
-- Definition of table `acme`.`formas_pago`
--

DROP TABLE IF EXISTS `acme`.`formas_pago`;
CREATE TABLE  `acme`.`formas_pago` (
  `id_forma_pago` int(10) NOT NULL AUTO_INCREMENT,
  `forma_pago` varchar(50) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `num_vencimientos` int(10) DEFAULT NULL,
  `dia_pago` int(10) DEFAULT NULL,
  `notas` longtext COLLATE latin1_spanish_ci,
  PRIMARY KEY (`forma_pago`),
  UNIQUE KEY `id_forma_pago` (`id_forma_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=1652224576 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`formas_pago`
--

/*!40000 ALTER TABLE `formas_pago` DISABLE KEYS */;
LOCK TABLES `formas_pago` WRITE;
INSERT INTO `acme`.`formas_pago` VALUES  (1647573978,'a 90 días',1,NULL,NULL),
 (9,'Al contado',1,NULL,NULL),
 (10,'Banco',1,NULL,NULL),
 (1652224575,'Efectivo',1,NULL,NULL),
 (1077092475,'Recibo domiciliado 90 días',1,NULL,NULL),
 (1100555655,'Talón',1,NULL,NULL),
 (11,'Transferencia',1,NULL,NULL);
UNLOCK TABLES;
/*!40000 ALTER TABLE `formas_pago` ENABLE KEYS */;


--
-- Definition of table `acme`.`ips`
--

DROP TABLE IF EXISTS `acme`.`ips`;
CREATE TABLE  `acme`.`ips` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` char(25) NOT NULL,
  `host` varchar(25) NOT NULL DEFAULT '',
  PRIMARY KEY (`ip`),
  KEY `new_index` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COMMENT='Nombre de las IP más habituales';

--
-- Dumping data for table `acme`.`ips`
--

/*!40000 ALTER TABLE `ips` DISABLE KEYS */;
LOCK TABLES `ips` WRITE;
INSERT INTO `acme`.`ips` VALUES  (2,'127.0.0.1','localhost');
UNLOCK TABLES;
/*!40000 ALTER TABLE `ips` ENABLE KEYS */;


--
-- Definition of table `acme`.`logins`
--

DROP TABLE IF EXISTS `acme`.`logins`;
CREATE TABLE  `acme`.`logins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL COMMENT 'Fecha de la conexión',
  `ip` char(25) NOT NULL COMMENT 'IP desde dónde se conecta',
  `user` char(10) NOT NULL DEFAULT '' COMMENT 'Usuario',
  `num_logins` int(11) NOT NULL DEFAULT '0' COMMENT 'Nº de conexiones del usuario en esa fecha y esa IP',
  `num_errors` int(11) NOT NULL DEFAULT '0' COMMENT 'Nº de conexiones erróneas',
  `changes` text COMMENT 'Cambios realizados, por ejemplo: UPDATE trabajadores(FCO), INSERT cursos(FTN-10-09), etc.',
  `revised` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Revisado cuando el num_errors es alto',
  PRIMARY KEY (`date`,`ip`,`user`),
  KEY `new_index` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=903 DEFAULT CHARSET=utf8 COMMENT='Contabiliza las conexiones en la extranet';

--
-- Dumping data for table `acme`.`logins`
--

/*!40000 ALTER TABLE `logins` DISABLE KEYS */;
LOCK TABLES `logins` WRITE;
INSERT INTO `acme`.`logins` VALUES  (899,'2011-02-22','84.78.184.185','acme',3,0,'INSERT clientes(1869979130), INSERT clientes(1869979131), INSERT cursos(C-01-11), SAVE cursos_materias(#2), SAVE cursos_clases(#7), INSERT facturas(D00001-11), SAVE facturas_cursos(#1), SAVE facturas_cursos(#1), UPDATE facturas(D00001-11), UPDATE facturas(D00001-11), SAVE facturas_cobros(#1), SAVE clientes_contactos(#1), SAVE clientes_contactos(#1), SAVE clientes_contactos(#1), SAVE clientes_contactos(#1), SAVE bancos(#3), SAVE citas(#1), SAVE pagos(#1), SAVE pagos(#1), SAVE facturas_cobros(#2), SAVE facturas_cobros(#1), UPDATE trabajadores(FCO), UPDATE trabajadores(QUIM), UPDATE trabajadores(FCO), UPDATE trabajadores(NANDO)',0),
 (900,'2011-02-23','84.78.184.185','acme',1,0,NULL,0),
 (902,'2011-02-23','84.78.184.185','admin',1,0,NULL,0),
 (901,'2011-02-23','95.63.113.151','acme',2,0,NULL,0);
UNLOCK TABLES;
/*!40000 ALTER TABLE `logins` ENABLE KEYS */;


--
-- Definition of table `acme`.`meses`
--

DROP TABLE IF EXISTS `acme`.`meses`;
CREATE TABLE  `acme`.`meses` (
  `id_mes` int(10) NOT NULL DEFAULT '0',
  `mes` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_mes`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`meses`
--

/*!40000 ALTER TABLE `meses` DISABLE KEYS */;
LOCK TABLES `meses` WRITE;
INSERT INTO `acme`.`meses` VALUES  (1,'Enero'),
 (2,'Febrero'),
 (3,'Marzo'),
 (4,'Abril'),
 (5,'Mayo'),
 (6,'Junio'),
 (7,'Julio'),
 (8,'Agosto'),
 (9,'Septiembre'),
 (10,'Octubre'),
 (11,'Noviembre'),
 (12,'Diciembre');
UNLOCK TABLES;
/*!40000 ALTER TABLE `meses` ENABLE KEYS */;


--
-- Definition of table `acme`.`pagos`
--

DROP TABLE IF EXISTS `acme`.`pagos`;
CREATE TABLE  `acme`.`pagos` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_trabajador` varchar(10) COLLATE latin1_spanish_ci NOT NULL COMMENT 'Trabajador al que se paga (obligatorio)',
  `fecha` date NOT NULL COMMENT 'Fecha del pago (obligatorio)',
  `horas` decimal(19,4) DEFAULT NULL COMMENT 'Horas pagadas',
  `id_curso` varchar(10) COLLATE latin1_spanish_ci DEFAULT NULL COMMENT 'Curso que se paga',
  `pago` decimal(19,4) NOT NULL DEFAULT '0.0000' COMMENT 'Cantidad pagada al trabajador (obligatorio)',
  `id_banco` int(11) DEFAULT NULL COMMENT 'Banco por dónde se paga',
  `notas` text COLLATE latin1_spanish_ci,
  PRIMARY KEY (`id_pago`) USING BTREE,
  KEY `fk_trabajador` (`id_trabajador`),
  KEY `fk_curso` (`id_curso`),
  KEY `fk_banco` (`id_banco`),
  CONSTRAINT `fk_banco` FOREIGN KEY (`id_banco`) REFERENCES `bancos` (`id_banco`),
  CONSTRAINT `fk_curso` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON UPDATE CASCADE,
  CONSTRAINT `fk_trabajador` FOREIGN KEY (`id_trabajador`) REFERENCES `trabajadores` (`id_trabajador`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci COMMENT='Pagos a los trabajadores';

--
-- Dumping data for table `acme`.`pagos`
--

/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
LOCK TABLES `pagos` WRITE;
INSERT INTO `acme`.`pagos` VALUES  (1,'QUIM','2011-02-22','10.0000','C-01-11','200.0000',1,'Asistencia técnica');
UNLOCK TABLES;
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;


--
-- Definition of table `acme`.`poblaciones`
--

DROP TABLE IF EXISTS `acme`.`poblaciones`;
CREATE TABLE  `acme`.`poblaciones` (
  `id_poblacion` int(10) NOT NULL AUTO_INCREMENT,
  `poblacion` varchar(50) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `provincia` varchar(25) COLLATE latin1_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`poblacion`),
  UNIQUE KEY `id_poblacion` (`id_poblacion`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`poblaciones`
--

/*!40000 ALTER TABLE `poblaciones` DISABLE KEYS */;
LOCK TABLES `poblaciones` WRITE;
INSERT INTO `acme`.`poblaciones` VALUES  (1,'-sin población-','-sin provincia-'),
 (38,'Agramunt','Lleida'),
 (36,'Alella','Barcelona'),
 (2,'Barcelona','Barcelona'),
 (3,'Bellaterra','Barcelona'),
 (4,'Berga','Barcelona'),
 (5,'Can Parellada Terrassa','Barcelona'),
 (6,'Cerdanyola','Barcelona'),
 (7,'Cerdanyola del Vallès','Barcelona'),
 (40,'Cornellá','Barcelona'),
 (8,'Esplugues del Llobregat','Barcelona'),
 (9,'Garrigella','Barcelona'),
 (10,'La Floresta','Barcelona'),
 (11,'Les Planes','Barcelona'),
 (12,'Martorell','Barcelona'),
 (13,'Mirasol','Barcelona'),
 (14,'Mirasol (Mas Janer)','Barcelona'),
 (15,'Molins de Rei','Barcelona'),
 (16,'Mollet','Barcelona'),
 (17,'Montcada','Barcelona'),
 (18,'Ripollet','Barcelona'),
 (19,'Rubí','Barcelona'),
 (20,'Sabadell','Barcelona'),
 (21,'Sant Adrià de Besòs','Barcelona'),
 (35,'Sant Andreu de la Barca','Barcelona'),
 (22,'Sant Cugat del Vallès','Barcelona'),
 (23,'Sant Cugat del Vallès (Mas Janer)','Barcelona'),
 (37,'Sant Esteve Sesrovires','Barcelona'),
 (24,'Sant Quirze','Barcelona'),
 (25,'Sant Quirze del Vallès','Barcelona'),
 (26,'Sant Vicens de Castellet','Barcelona'),
 (27,'Santa Coloma','Barcelona'),
 (28,'Talavera de la Reyna','Barcelona'),
 (29,'Terrassa','Barcelona'),
 (30,'Torrelles de Llobregat','Barcelona'),
 (31,'Valldoreix','Barcelona'),
 (32,'Vallvidrera','Barcelona'),
 (33,'Viladecaballs','Barcelona'),
 (34,'Vilafranca del Penedés','Barcelona');
UNLOCK TABLES;
/*!40000 ALTER TABLE `poblaciones` ENABLE KEYS */;


--
-- Definition of table `acme`.`tabla_bancos`
--

DROP TABLE IF EXISTS `acme`.`tabla_bancos`;
CREATE TABLE  `acme`.`tabla_bancos` (
  `banco` varchar(25) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`banco`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `acme`.`tabla_bancos`
--

/*!40000 ALTER TABLE `tabla_bancos` DISABLE KEYS */;
LOCK TABLES `tabla_bancos` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `tabla_bancos` ENABLE KEYS */;


--
-- Definition of table `acme`.`tareas`
--

DROP TABLE IF EXISTS `acme`.`tareas`;
CREATE TABLE  `acme`.`tareas` (
  `id_tarea` int(10) NOT NULL AUTO_INCREMENT,
  `fecha_tarea` date DEFAULT NULL,
  `tarea` varchar(300) COLLATE latin1_spanish_ci DEFAULT NULL,
  `prioridad` tinyint(3) unsigned DEFAULT '5',
  `acabada` tinyint(1) NOT NULL DEFAULT '0',
  `id_usuario` varchar(10) COLLATE latin1_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_tarea`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `acme`.`tareas`
--

/*!40000 ALTER TABLE `tareas` DISABLE KEYS */;
LOCK TABLES `tareas` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `tareas` ENABLE KEYS */;


--
-- Definition of table `acme`.`trabajadores`
--

DROP TABLE IF EXISTS `acme`.`trabajadores`;
CREATE TABLE  `acme`.`trabajadores` (
  `id_trabajador` varchar(10) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `trabajador` varchar(25) COLLATE latin1_spanish_ci DEFAULT NULL,
  `apellidos` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `telefono` varchar(100) COLLATE latin1_spanish_ci DEFAULT NULL,
  `direccion` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `cp` varchar(5) COLLATE latin1_spanish_ci DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `id_poblacion` int(10) DEFAULT NULL,
  `nif` varchar(15) COLLATE latin1_spanish_ci DEFAULT NULL,
  `retencion_trabajador` double(15,5) DEFAULT NULL,
  `correo` varchar(50) COLLATE latin1_spanish_ci DEFAULT NULL,
  `seleccionado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_alta` date DEFAULT NULL,
  `fecha_baja` date DEFAULT NULL,
  `notas` longtext COLLATE latin1_spanish_ci,
  `clave` varchar(32) COLLATE latin1_spanish_ci DEFAULT NULL,
  `num_trabajador` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id_trabajador`),
  KEY `id_poblacion` (`id_poblacion`),
  KEY `num_trabajador` (`num_trabajador`),
  CONSTRAINT `trabajadores_ibfk_1` FOREIGN KEY (`id_poblacion`) REFERENCES `poblaciones` (`id_poblacion`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `acme`.`trabajadores`
--

/*!40000 ALTER TABLE `trabajadores` DISABLE KEYS */;
LOCK TABLES `trabajadores` WRITE;
INSERT INTO `acme`.`trabajadores` VALUES  ('FCO','Francisco','Cascales Rueda','móvil: 667-551-687  casa:93-441-60-52','Paseo Montjuic, 32, 3º 1ª','08004','1995-03-12 00:00:00',2,'46563073X',0.00000,'fco@proinf.net',-1,'2002-02-27',NULL,'Programador','6d3cc44195a12f46f4d2ba03434ef0c3',12),
 ('NANDO','Fernando','Muñoz Seco','656-40-58-59   93-512-51-33   607-47-65-70','Susqueda 11, 5º 1ª','08202','2002-01-10 00:00:00',20,'33900896T',0.00000,'fernando@progyman.com',0,'2002-02-27',NULL,'Casa padres: 93-717-87-87','0b0808ca4dc8a96bc33801ef1d405128',21),
 ('QUIM','Quim','Anton Bellmunt','móvil: 667-551-698   casa: 93-540-12-88','C/Bovira 14-16, 1º 2ª','08004','1997-08-01 00:00:00',2,'38509242C',0.00000,'quim@acme.net',-1,'2002-02-27',NULL,'quimet22@hotmail.com','6d3cc44195a12f46f4d2ba03434ef0c3',25);
UNLOCK TABLES;
/*!40000 ALTER TABLE `trabajadores` ENABLE KEYS */;


--
-- Definition of table `acme`.`usuarios`
--

DROP TABLE IF EXISTS `acme`.`usuarios`;
CREATE TABLE  `acme`.`usuarios` (
  `id_usuario` varchar(10) COLLATE latin1_spanish_ci NOT NULL DEFAULT '',
  `clave` varchar(32) COLLATE latin1_spanish_ci DEFAULT NULL COMMENT 'HASH de la contraseña con MD5',
  `usuario` varchar(25) COLLATE latin1_spanish_ci DEFAULT NULL COMMENT 'Nombre al conectar',
  `paginas` varchar(100) COLLATE latin1_spanish_ci DEFAULT NULL COMMENT 'Páginas con acceso (sino es administrador) entre corchetes y sin .html',
  `filtros` text COLLATE latin1_spanish_ci COMMENT 'filtro indicado por página',
  `activo` tinyint(1) NOT NULL DEFAULT '0' COMMENT '¿Es un usuario permitido?',
  `escritura` tinyint(1) NOT NULL DEFAULT '0' COMMENT '¿Puede realizar cambios?',
  `administracion` tinyint(1) NOT NULL DEFAULT '0' COMMENT '¿Es administrador?',
  `notas` longtext COLLATE latin1_spanish_ci,
  `ip` char(25) COLLATE latin1_spanish_ci DEFAULT NULL COMMENT 'calc: Dirección de la última conexión',
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `acme`.`usuarios`
--

/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
LOCK TABLES `usuarios` WRITE;
INSERT INTO `acme`.`usuarios` VALUES  ('acme','53bce4f1dfa0fe8e7ca126f91b35d3a6','ACME',NULL,NULL,1,1,1,NULL,NULL),
 ('admin','53bce4f1dfa0fe8e7ca126f91b35d3a6','Admin',NULL,NULL,1,1,1,NULL,NULL);
UNLOCK TABLES;
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;


--
-- Definition of procedure `acme`.`calcular_num_clase`
--

DROP PROCEDURE IF EXISTS `acme`.`calcular_num_clase`;

DELIMITER $$

/*!50003 SET @TEMP_SQL_MODE=@@SQL_MODE, SQL_MODE='' */ $$
CREATE DEFINER=`fco`@`%` PROCEDURE  `acme`.`calcular_num_clase`()
BEGIN

drop table if exists temp_clases;
create table if not exists temp_clases(id_clase int primary key, num_clase smallint, total_clases smallint);

insert into temp_clases
  select
    id_clase,
    (select count(*) from cursos_clases cc2
     where cc.id_curso = cc2.id_curso
     and date_add(cc.fecha, interval cc.hora_inicio hour_second) >= date_add(cc2.fecha, interval cc2.hora_inicio hour_second)) as num_clase,
    (select count(*) from cursos_clases cc3
     where cc.id_curso = cc3.id_curso) as total_clases
  from cursos_clases cc;

UPDATE cursos_clases cc JOIN temp_clases tmp using (id_clase) set cc.num_clase = tmp.num_clase, cc.total_clases = tmp.total_clases;

drop table temp_clases;

END $$
/*!50003 SET SESSION SQL_MODE=@TEMP_SQL_MODE */  $$

DELIMITER ;

--
-- Definition of procedure `acme`.`migrar_facturas`
--

DROP PROCEDURE IF EXISTS `acme`.`migrar_facturas`;

DELIMITER $$

/*!50003 SET @TEMP_SQL_MODE=@@SQL_MODE, SQL_MODE='' */ $$
CREATE DEFINER=`fco`@`%` PROCEDURE  `acme`.`migrar_facturas`()
BEGIN

 DELETE FROM facturas_cursos WHERE id_factura in (SELECT id_factura FROM facturas WHERE not id_curso is null);

 INSERT INTO facturas_cursos(id_factura, id_curso, detalle, horas, precio_hora, subtotal)
 SELECT id_factura, id_curso, detalle, horas, precio_hora, subtotal FROM facturas WHERE not id_curso is null;

END $$
/*!50003 SET SESSION SQL_MODE=@TEMP_SQL_MODE */  $$

DELIMITER ;

--
-- Definition of view `acme`.`citas_horario`
--

DROP TABLE IF EXISTS `acme`.`citas_horario`;
DROP VIEW IF EXISTS `acme`.`citas_horario`;
CREATE ALGORITHM=UNDEFINED DEFINER=`user`@`%` SQL SECURITY DEFINER VIEW `acme`.`citas_horario` AS select `acme`.`cursos_clases`.`id_clase` AS `id`,_utf8'clase' AS `tipo`,`acme`.`cursos_clases`.`id_curso` AS `tema`,concat(ifnull(`acme`.`cursos_clases`.`num_clase`,0),_latin1'/',ifnull(`acme`.`cursos_clases`.`total_clases`,0),_latin1' ',`acme`.`cursos`.`curso`,_latin1' - ',`acme`.`cursos_clases`.`id_materia`) AS `titulo`,`acme`.`cursos_clases`.`fecha` AS `fecha`,`acme`.`cursos_clases`.`hora_inicio` AS `hora`,`acme`.`cursos_clases`.`duracion` AS `duracion`,`acme`.`cursos_clases`.`id_trabajador` AS `usuario`,_utf8'#00CCCC' AS `colorear` from (`acme`.`cursos_clases` join `acme`.`cursos` on((`acme`.`cursos_clases`.`id_curso` = `acme`.`cursos`.`id_curso`))) where isnull(`acme`.`cursos`.`fecha_baja`) union select `acme`.`citas`.`id_cita` AS `Id`,_utf8'cita' AS `tipo`,`acme`.`citas`.`tema` AS `tema`,`acme`.`citas`.`titulo` AS `titulo`,`acme`.`citas`.`fecha` AS `fecha`,`acme`.`citas`.`hora` AS `hora`,`acme`.`citas`.`duracion` AS `duracion`,`acme`.`citas`.`usuario` AS `usuario`,_utf8'#CCCC00' AS `colorear` from `acme`.`citas`;

--
-- Definition of view `acme`.`tasks`
--

DROP TABLE IF EXISTS `acme`.`tasks`;
DROP VIEW IF EXISTS `acme`.`tasks`;
CREATE ALGORITHM=UNDEFINED DEFINER=`user`@`%` SQL SECURITY DEFINER VIEW `acme`.`tasks` AS select concat(_utf8'clase',`cc`.`id_clase`) AS `id`,`cc`.`id_curso` AS `summary`,concat(`c`.`curso`,_latin1' - ',`cc`.`id_materia`) AS `description`,(`cc`.`fecha` + interval date_format(`cc`.`hora_inicio`,_utf8'%H:%i') hour_minute) AS `dtstart`,((`cc`.`fecha` + interval date_format(`cc`.`hora_inicio`,_utf8'%H:%i') hour_minute) + interval (`cc`.`duracion` * 60) minute) AS `dtend`,`cc`.`id_trabajador` AS `calendar`,concat(coalesce(`cc`.`num_clase`,0),_utf8'/',coalesce(`cc`.`total_clases`,0)) AS `sequence` from (`acme`.`cursos_clases` `cc` join `acme`.`cursos` `c` on((`cc`.`id_curso` = `c`.`id_curso`))) union select concat(_utf8'cita',`i`.`id_cita`) AS `id`,`i`.`tema` AS `summary`,`i`.`titulo` AS `description`,(`i`.`fecha` + interval date_format(`i`.`hora`,_utf8'%H:%i') hour_minute) AS `dtstart`,((`i`.`fecha` + interval date_format(`i`.`hora`,_utf8'%H:%i') hour_minute) + interval (`i`.`duracion` * 60) minute) AS `dtend`,`i`.`usuario` AS `calendar`,_utf8'cita' AS `sequence` from `acme`.`citas` `i`;

--
-- Definition of view `acme`.`tasks_allday`
--

DROP TABLE IF EXISTS `acme`.`tasks_allday`;
DROP VIEW IF EXISTS `acme`.`tasks_allday`;
CREATE ALGORITHM=UNDEFINED DEFINER=`user`@`%` SQL SECURITY DEFINER VIEW `acme`.`tasks_allday` AS select concat(_utf8'festivo',`f`.`id`) AS `id`,_utf8'festivo' AS `summary`,`f`.`descripcion` AS `description`,`f`.`fecha` AS `dtstart`,(`f`.`fecha` + interval _utf8'23:59:59' hour_second) AS `dtend`,_utf8'festivo' AS `calendar`,_utf8'festivo' AS `sequence` from `acme`.`festivos` `f`;



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
