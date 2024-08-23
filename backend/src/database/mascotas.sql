-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-08-2024 a las 02:55:00
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `adopcion_mascotas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mascotas`
--

CREATE TABLE `mascotas` (
  `id_mascota` int(11) NOT NULL,
  `nombre_mascota` varchar(50) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `estado` enum('En Adopcion','Urgente','Adoptado','Reservado') NOT NULL DEFAULT 'En Adopcion',
  `descripcion` varchar(300) DEFAULT NULL,
  `esterilizado` enum('si','no') NOT NULL,
  `tamano` enum('Pequeno','Mediano','Intermedio','Grande') NOT NULL,
  `peso` decimal(5,2) NOT NULL,
  `fk_id_categoria` int(11) DEFAULT NULL,
  `fk_id_raza` int(11) DEFAULT NULL,
  `fk_id_departamento` int(11) DEFAULT NULL,
  `fk_id_municipio` int(11) DEFAULT NULL,
  `sexo` enum('Macho','Hembra') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mascotas`
--

INSERT INTO `mascotas` (`id_mascota`, `nombre_mascota`, `fecha_nacimiento`, `estado`, `descripcion`, `esterilizado`, `tamano`, `peso`, `fk_id_categoria`, `fk_id_raza`, `fk_id_departamento`, `fk_id_municipio`, `sexo`) VALUES
(7, 'Mascota sin imagen1', '2222-02-22', 'En Adopcion', 'erfe ', 'si', 'Mediano', 2.00, 4, 9, 1, 1, 'Macho');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `mascotas`
--
ALTER TABLE `mascotas`
  ADD PRIMARY KEY (`id_mascota`),
  ADD KEY `fk_id_categoria` (`fk_id_categoria`),
  ADD KEY `fk_id_raza` (`fk_id_raza`),
  ADD KEY `fk_id_departamento` (`fk_id_departamento`),
  ADD KEY `fk_id_municipio` (`fk_id_municipio`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `mascotas`
--
ALTER TABLE `mascotas`
  MODIFY `id_mascota` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `mascotas`
--
ALTER TABLE `mascotas`
  ADD CONSTRAINT `mascotas_ibfk_1` FOREIGN KEY (`fk_id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE CASCADE,
  ADD CONSTRAINT `mascotas_ibfk_2` FOREIGN KEY (`fk_id_raza`) REFERENCES `razas` (`id_raza`) ON DELETE CASCADE,
  ADD CONSTRAINT `mascotas_ibfk_3` FOREIGN KEY (`fk_id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE CASCADE,
  ADD CONSTRAINT `mascotas_ibfk_4` FOREIGN KEY (`fk_id_municipio`) REFERENCES `municipios` (`id_municipio`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
