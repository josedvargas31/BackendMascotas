import { pool } from "../database/conexion.js";
import fs from "fs";
import path from "path";
import { validationResult } from "express-validator";

// Listar Mascotas con Imágenes y Detalles Asociados
export const listarMascotas = async (req, res) => {
    try {
        // Consulta SQL para obtener mascotas y sus imágenes asociadas, incluyendo los nombres de las FK
        const [result] = await pool.query(`
            SELECT 
                m.id_mascota,
                m.nombre_mascota,
                m.fecha_nacimiento,
                m.estado,
                m.descripcion,
                m.esterilizado,
                m.tamano,
                m.peso,
                c.nombre_categoria AS categoria,
                r.nombre_raza AS raza,
                d.nombre_departamento AS departamento,
                mu.nombre_municipio AS municipio,
                m.sexo,
                i.ruta_imagen
            FROM mascotas m
            LEFT JOIN imagenes i ON m.id_mascota = i.fk_id_mascota
            LEFT JOIN categorias c ON m.fk_id_categoria = c.id_categoria
            LEFT JOIN razas r ON m.fk_id_raza = r.id_raza
            LEFT JOIN departamentos d ON m.fk_id_departamento = d.id_departamento
            LEFT JOIN municipios mu ON m.fk_id_municipio = mu.id_municipio
        `);

        // Agrupar las imágenes por mascota
        const mascotas = result.reduce((acc, item) => {
            const {
                id_mascota,
                nombre_mascota,
                fecha_nacimiento,
                estado,
                descripcion,
                esterilizado,
                tamano,
                peso,
                categoria,
                raza,
                departamento,
                municipio,
                sexo,
                ruta_imagen
            } = item;

            // Verificar si la mascota ya está en el acumulador
            if (!acc[id_mascota]) {
                acc[id_mascota] = {
                    id_mascota,
                    nombre_mascota,
                    fecha_nacimiento,
                    estado,
                    descripcion,
                    esterilizado,
                    tamano,
                    peso,
                    categoria,
                    raza,
                    departamento,
                    municipio,
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
			nombre_mascota,
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
			"INSERT INTO mascotas (nombre_mascota, fecha_nacimiento, estado, descripcion, esterilizado, tamano, peso, fk_id_categoria, fk_id_raza, fk_id_departamento, fk_id_municipio, sexo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				nombre_mascota,
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

// // Controlador para iniciar el proceso de adopción
// export const iniciarAdopcion = async (req, res) => {
//     try {
//         // Validar los datos de entrada
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         // Obtener parámetros y cuerpo de la solicitud
//         const { id_mascota } = req.params;
//         const { id_usuario } = req.body;

//         // Verificar si el usuario existe
//         const [usuarioResult] = await pool.query("SELECT id_usuario FROM usuarios WHERE id_usuario = ?", [id_usuario]);
//         if (usuarioResult.length === 0) {
//             return res.status(404).json({
//                 status: 404,
//                 message: 'No se encontró el usuario'
//             });
//         }

//         // Verificar si la mascota existe y su estado actual
//         const [mascotaResult] = await pool.query("SELECT estado FROM mascotas WHERE id_mascota = ?", [id_mascota]);

//         if (mascotaResult.length > 0) {
//             const estadoMascota = mascotaResult[0].estado;

//             // Verificar si la mascota está disponible para adopción
//             if (estadoMascota === 'En Adopcion') {
//                 // Iniciar el proceso de adopción
//                 const [insertAdopcion] = await pool.query(
//                     "INSERT INTO adopciones (fk_id_mascota, fk_id_usuario_adoptante, fecha_adopcion, estado) VALUES (?, ?, CURDATE(), 'proceso de adopcion')",
//                     [id_mascota, id_usuario]
//                 );

//                 // Verificar si la adopción se insertó correctamente
//                 if (insertAdopcion.affectedRows > 0) {
//                     // Actualizar el estado de la mascota
//                     await pool.query("UPDATE mascotas SET estado = 'Reservado' WHERE id_mascota = ?", [id_mascota]);
//                     res.status(200).json({
//                         status: 200,
//                         message: 'Proceso de adopción iniciado correctamente'
//                     });
//                 } else {
//                     res.status(500).json({
//                         status: 500,
//                         message: 'No se pudo iniciar el proceso de adopción'
//                     });
//                 }
//             } else {
//                 res.status(400).json({
//                     status: 400,
//                     message: 'La mascota no está disponible para adopción'
//                 });
//             }
//         } else {
//             res.status(404).json({
//                 status: 404,
//                 message: 'No se encontró la mascota'
//             });
//         }
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             message: 'Error en el sistema: ' + error.message
//         });
//     }
// };

// // Controlador para administrar la adopción (aceptar o denegar)
// export const administrarAdopcion = async (req, res) => {
//     try {
//         // Validar los datos de entrada
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         // Obtener parámetros y cuerpo de la solicitud
//         const { id_adopcion } = req.params;
//         const { accion } = req.body;

//         // Verificar si la solicitud de adopción existe
//         const [adopcionResult] = await pool.query("SELECT * FROM adopciones WHERE id_adopcion = ?", [id_adopcion]);
//         if (adopcionResult.length === 0) {
//             return res.status(404).json({
//                 status: 404,
//                 message: 'No se encontró la solicitud de adopción'
//             });
//         }

//         const adopcion = adopcionResult[0];
//         let nuevoEstadoMascota;

//         // Procesar la acción solicitada
//         if (accion === 'aceptar') {
//             nuevoEstadoMascota = 'Adoptado';
//             await pool.query("UPDATE adopciones SET estado = 'aceptada' WHERE id_adopcion = ?", [id_adopcion]);
//         } else if (accion === 'denegar') {
//             nuevoEstadoMascota = 'En Adopcion'; // Estado a recuperar si se deniega la adopción
//             await pool.query("UPDATE adopciones SET estado = 'rechazada' WHERE id_adopcion = ?", [id_adopcion]);
//         } else {
//             return res.status(400).json({
//                 status: 400,
//                 message: 'Acción no válida'
//             });
//         }

//         // Actualizar el estado de la mascota
//         const [updateResult] = await pool.query("UPDATE mascotas SET estado = ? WHERE id_mascota = ?", [nuevoEstadoMascota, adopcion.fk_id_mascota]);
//         if (updateResult.affectedRows > 0) {
//             res.status(200).json({
//                 status: 200,
//                 message: `La adopción ha sido ${accion === 'aceptar' ? 'aceptada' : 'denegada'}`
//             });
//         } else {
//             res.status(404).json({
//                 status: 404,
//                 message: 'No se pudo actualizar el estado de la mascota'
//             });
//         }
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             message: 'Error en el sistema: ' + error.message
//         });
//     }
// };

// // Controlador para listar mascotas con usuarios asociados en proceso de adopción
// export const listarMascotasConUsuarios = async (req, res) => {
//     try {
//         const [mascotasResult] = await pool.query(
//             `SELECT m.*, u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, a.estado AS estado_adopcion
//              FROM mascotas m
//              JOIN adopciones a ON m.id_mascota = a.fk_id_mascota
//              JOIN usuarios u ON a.fk_id_usuario_adoptante = u.id_usuario
//              WHERE m.estado = 'Reservado' AND a.estado = 'proceso de adopcion'`
//         );

//         if (mascotasResult.length === 0) {
//             return res.status(404).json({
//                 status: 404,
//                 message: 'No se encontraron mascotas en proceso de adopción'
//             });
//         }

//         res.status(200).json(mascotasResult);
//     } catch (error) {
//         console.error('Error al listar mascotas con usuarios:', error); // Registro del error en la consola del servidor
//         res.status(500).json({
//             status: 500,
//             message: 'Error en el sistema: ' + error.message
//         });
//     }
// };


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
			nombre_mascota,
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
			 SET nombre_mascota=?, fecha_nacimiento=?, estado=?, descripcion=?, 
			 esterilizado=?, tamano=?, peso=?, fk_id_categoria=?, fk_id_raza=?, 
			 fk_id_departamento=?, fk_id_municipio=?, sexo=? 
			 WHERE id_mascota=?`,
			[
				nombre_mascota,
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
					nombre_mascota,
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
