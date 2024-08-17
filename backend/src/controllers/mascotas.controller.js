import { pool } from "../database/conexion.js";
import fs from "fs";
import path from "path";
// import { validationResult } from "express-validator";

// Listar Mascotas con Imágenes
export const listarMascotas = async (req, res) => {
	try {
		// Consulta SQL para obtener mascotas y sus imágenes asociadas
		const [result] = await pool.query(`
			SELECT 
				m.id_mascota,
				m.nombre,
				m.fecha_nacimiento,
				m.estado,
				m.descripcion,
				m.esterilizado,
				m.tamano,
				m.peso,
				m.fk_id_categoria,
				m.fk_id_raza,
				m.fk_id_departamento,
				m.fk_id_municipio,
				m.sexo,
				i.ruta_imagen
			FROM mascotas m
			LEFT JOIN imagenes i ON m.id_mascota = i.fk_id_mascota
		`);

		// Agrupar las imágenes por mascota
		const mascotas = result.reduce((acc, item) => {
			const { id_mascota, nombre, fecha_nacimiento, estado, descripcion, esterilizado, tamano, peso, fk_id_categoria, fk_id_raza, fk_id_departamento, fk_id_municipio, sexo, ruta_imagen } = item;

			// Verificar si la mascota ya está en el acumulador
			if (!acc[id_mascota]) {
				acc[id_mascota] = {
					id_mascota,
					nombre,
					fecha_nacimiento,
					estado,
					descripcion,
					esterilizado,
					tamano,
					peso,
					fk_id_categoria,
					fk_id_raza,
					fk_id_departamento,
					fk_id_municipio,
					sexo,
					imagenes: []
				};
			}

			// Agregar la imagen a la mascota correspondiente
			if (ruta_imagen) {
				acc[id_mascota].imagenes.push(ruta_imagen);
			}

			return acc;
		}, {});

		// Convertir el objeto en un array
		const mascotasArray = Object.values(mascotas);

		// Enviar la respuesta
		res.status(200).json(mascotasArray);
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor: " + error.message,
		});
	}
};

// Registrar Mascota
export const registrarMascota = async (req, res) => {
	try {
		const {
			nombre,
			fecha_nacimiento,
			estado = "En Adopcion", // Valor por defecto
			descripcion,
			esterilizado,
			tamano,
			peso,
			fk_id_categoria,
			fk_id_raza,
			fk_id_departamento,
			fk_id_municipio,
			sexo,
		} = req.body;

		const files = req.files || []; // Si no hay archivos, usar un array vacío

		// Insertar la nueva mascota
		const [result] = await pool.query(
			"INSERT INTO mascotas (nombre, fecha_nacimiento, estado, descripcion, esterilizado, tamano, peso, fk_id_categoria, fk_id_raza, fk_id_departamento, fk_id_municipio, sexo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				nombre,
				fecha_nacimiento,
				estado,
				descripcion,
				esterilizado,
				tamano,
				parseFloat(peso),
				fk_id_categoria,
				fk_id_raza,
				fk_id_departamento,
				fk_id_municipio,
				sexo,
			]
		);

		const idMascota = result.insertId; // Obtener el ID de la nueva mascota

		// Si se suben imágenes, insertarlas en la tabla imagenes
		if (Array.isArray(files) && files.length > 0) {
			const imageQueries = files.map((file) =>
				pool.query(
					"INSERT INTO imagenes (fk_id_mascota, ruta_imagen) VALUES (?, ?)",
					[idMascota, file.filename] // file.filename contiene solo el nombre del archivo
				)
			);
			await Promise.all(imageQueries); // Ejecutar todas las consultas de inserción
		}

		// Verificar si la mascota fue registrada exitosamente
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Mascota registrada exitosamente",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se pudo registrar la mascota",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor: " + error.message,
		});
	}
};

// Controlador para obtener conteo de mascotas por estado
export const obtenerConteoPorEstado = async (req, res) => {
	try {
		// Consulta para obtener el conteo de mascotas por estado
		const [result] = await pool.query(`
          SELECT estado, COUNT(*) as total
          FROM mascotas
          GROUP BY estado
      `);

		res.status(200).json(result);
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el sistema: " + error.message,
		});
	}
};

// Actualizar Mascota por ID
export const actualizarMascota = async (req, res) => {
	try {
		const { id_mascota } = req.params;
		const {
			nombre,
			fecha_nacimiento,
			estado,
			descripcion,
			esterilizado,
			tamano,
			peso,
			fk_id_categoria,
			fk_id_raza,
			fk_id_departamento,
			fk_id_municipio,
			sexo,
		} = req.body;

		const nuevasFotos = req.files || []; // Nuevas imágenes subidas

		// Actualizar la información de la mascota
		const [result] = await pool.query(
			`UPDATE mascotas 
			 SET nombre=?, fecha_nacimiento=?, estado=?, descripcion=?, 
			 esterilizado=?, tamano=?, peso=?, fk_id_categoria=?, fk_id_raza=?, 
			 fk_id_departamento=?, fk_id_municipio=?, sexo=? 
			 WHERE id_mascota=?`,
			[
				nombre,
				fecha_nacimiento,
				estado,
				descripcion,
				esterilizado,
				tamano,
				peso,
				fk_id_categoria,
				fk_id_raza,
				fk_id_departamento,
				fk_id_municipio,
				sexo,
				id_mascota,
			]
		);

		if (result.affectedRows > 0) {
			// Si hay nuevas fotos, actualizarlas en la base de datos
			if (Array.isArray(nuevasFotos) && nuevasFotos.length > 0) {
				// Obtener las fotos actuales de la base de datos
				const [currentImages] = await pool.query(
					"SELECT ruta_imagen FROM imagenes WHERE fk_id_mascota=?",
					[id_mascota]
				);

				// Eliminar las fotos actuales del servidor
				currentImages.forEach((img) => {
					fs.unlink(path.join("uploads", img.ruta_imagen), (err) => {
						if (err) console.error("No se pudo eliminar la imagen anterior:", err);
					});
				});

				// Eliminar las fotos actuales de la base de datos
				await pool.query("DELETE FROM imagenes WHERE fk_id_mascota=?", [id_mascota]);

				// Insertar las nuevas fotos en la base de datos
				const imageQueries = nuevasFotos.map((file) =>
					pool.query(
						"INSERT INTO imagenes (fk_id_mascota, ruta_imagen) VALUES (?, ?)",
						[id_mascota, file.filename]
					)
				);
				await Promise.all(imageQueries);
			}

			res.status(200).json({
				status: 200,
				message: "Mascota actualizada exitosamente",
				data: {
					id_mascota,
					nombre,
					fecha_nacimiento,
					estado,
					descripcion,
					esterilizado,
					tamano,
					peso,
					fk_id_categoria,
					fk_id_raza,
					fk_id_departamento,
					fk_id_municipio,
					sexo,
				},
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se pudo actualizar la mascota",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor: " + error.message,
		});
	}
};

// Eliminar Mascota por ID
export const eliminarMascota = async (req, res) => {
	try {
		const { id_mascota } = req.params;
		const [result] = await pool.query(
			"DELETE FROM Mascotas WHERE id_mascota=?",
			[id_mascota]
		);
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Mascota eliminada",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se eliminó la mascota",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Buscar Mascota por ID
export const buscarMascota = async (req, res) => {
	try {
		const { id_mascota } = req.params;
		const [result] = await pool.query(
			"SELECT * FROM Mascotas WHERE id_mascota=?",
			[id_mascota]
		);
		if (result.length > 0) {
			res.status(200).json({
				status: 200,
				message: "Mascota encontrada",
				data: result[0],
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "Mascota no encontrada",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};
