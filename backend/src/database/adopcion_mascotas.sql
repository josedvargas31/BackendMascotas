-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-10-2024 a las 03:23:13
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
-- Estructura de tabla para la tabla `adopciones`
--

CREATE TABLE `adopciones` (
  `id_adopcion` int(11) NOT NULL,
  `fk_id_mascota` int(11) DEFAULT NULL,
  `fk_id_usuario_adoptante` int(11) NOT NULL,
  `fecha_adopcion_proceso` date DEFAULT NULL,
  `fecha_adopcion_aceptada` date DEFAULT NULL,
  `estado` enum('aceptada','rechazada','proceso de adopcion') DEFAULT NULL,
  `estado_anterior` enum('En Adopcion','Urgente') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre_categoria` varchar(50) NOT NULL,
  `estado` enum('activa','inactiva') NOT NULL DEFAULT 'activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `departamentos`
--

CREATE TABLE `departamentos` (
  `id_departamento` int(11) NOT NULL,
  `nombre_departamento` varchar(50) NOT NULL,
  `codigo_dane` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes`
--

CREATE TABLE `imagenes` (
  `id_imagen` int(11) NOT NULL,
  `fk_id_mascota` int(11) NOT NULL,
  `ruta_imagen` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `municipios`
--

CREATE TABLE `municipios` (
  `id_municipio` int(11) NOT NULL,
  `nombre_municipio` varchar(50) NOT NULL,
  `codigo_dane` varchar(10) NOT NULL,
  `fk_id_departamento` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id_notificacion` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `leido` tinyint(1) DEFAULT 0,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('aceptada','rechazada','proceso de adopcion','pendiente') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `razas`
--

CREATE TABLE `razas` (
  `id_raza` int(11) NOT NULL,
  `nombre_raza` varchar(50) NOT NULL,
  `fk_id_categoria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `direccion` varchar(100) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `correo` varchar(50) NOT NULL,
  `tipo_documento` enum('tarjeta','cedula','tarjeta de extranjeria') NOT NULL,
  `documento_identidad` varchar(20) NOT NULL,
  `password` varchar(200) NOT NULL,
  `img` varchar(255) DEFAULT NULL,
  `rol` enum('superusuario','administrador','usuario') NOT NULL DEFAULT 'usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacunas`
--

CREATE TABLE `vacunas` (
  `id_vacuna` int(11) NOT NULL,
  `fk_id_mascota` int(11) DEFAULT NULL,
  `fecha_vacuna` date NOT NULL,
  `enfermedad` varchar(100) NOT NULL,
  `estado` enum('Completa','Incompleta','En proceso','no se') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `adopciones`
--
ALTER TABLE `adopciones`
  ADD PRIMARY KEY (`id_adopcion`),
  ADD KEY `fk_id_mascota` (`fk_id_mascota`),
  ADD KEY `fk_id_usuario_adoptante` (`fk_id_usuario_adoptante`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `departamentos`
--
ALTER TABLE `departamentos`
  ADD PRIMARY KEY (`id_departamento`),
  ADD UNIQUE KEY `codigo_dane` (`codigo_dane`);

--
-- Indices de la tabla `imagenes`
--
ALTER TABLE `imagenes`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `fk_id_mascota` (`fk_id_mascota`);

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
-- Indices de la tabla `municipios`
--
ALTER TABLE `municipios`
  ADD PRIMARY KEY (`id_municipio`),
  ADD UNIQUE KEY `codigo_dane` (`codigo_dane`),
  ADD KEY `fk_id_departamento` (`fk_id_departamento`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `razas`
--
ALTER TABLE `razas`
  ADD PRIMARY KEY (`id_raza`),
  ADD KEY `fk_id_categoria` (`fk_id_categoria`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `documento_identidad` (`documento_identidad`);

--
-- Indices de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  ADD PRIMARY KEY (`id_vacuna`),
  ADD KEY `fk_id_mascota` (`fk_id_mascota`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `adopciones`
--
ALTER TABLE `adopciones`
  MODIFY `id_adopcion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `departamentos`
--
ALTER TABLE `departamentos`
  MODIFY `id_departamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `imagenes`
--
ALTER TABLE `imagenes`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `mascotas`
--
ALTER TABLE `mascotas`
  MODIFY `id_mascota` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `municipios`
--
ALTER TABLE `municipios`
  MODIFY `id_municipio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id_notificacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `razas`
--
ALTER TABLE `razas`
  MODIFY `id_raza` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  MODIFY `id_vacuna` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `adopciones`
--
ALTER TABLE `adopciones`
  ADD CONSTRAINT `adopciones_ibfk_1` FOREIGN KEY (`fk_id_mascota`) REFERENCES `mascotas` (`id_mascota`) ON DELETE CASCADE,
  ADD CONSTRAINT `adopciones_ibfk_2` FOREIGN KEY (`fk_id_usuario_adoptante`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `imagenes`
--
ALTER TABLE `imagenes`
  ADD CONSTRAINT `imagenes_ibfk_1` FOREIGN KEY (`fk_id_mascota`) REFERENCES `mascotas` (`id_mascota`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mascotas`
--
ALTER TABLE `mascotas`
  ADD CONSTRAINT `mascotas_ibfk_1` FOREIGN KEY (`fk_id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE CASCADE,
  ADD CONSTRAINT `mascotas_ibfk_2` FOREIGN KEY (`fk_id_raza`) REFERENCES `razas` (`id_raza`) ON DELETE CASCADE,
  ADD CONSTRAINT `mascotas_ibfk_3` FOREIGN KEY (`fk_id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE CASCADE,
  ADD CONSTRAINT `mascotas_ibfk_4` FOREIGN KEY (`fk_id_municipio`) REFERENCES `municipios` (`id_municipio`) ON DELETE CASCADE;

--
-- Filtros para la tabla `municipios`
--
ALTER TABLE `municipios`
  ADD CONSTRAINT `municipios_ibfk_1` FOREIGN KEY (`fk_id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `razas`
--
ALTER TABLE `razas`
  ADD CONSTRAINT `razas_ibfk_1` FOREIGN KEY (`fk_id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE CASCADE;

--
-- Filtros para la tabla `vacunas`
--
ALTER TABLE `vacunas`
  ADD CONSTRAINT `vacunas_ibfk_1` FOREIGN KEY (`fk_id_mascota`) REFERENCES `mascotas` (`id_mascota`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
