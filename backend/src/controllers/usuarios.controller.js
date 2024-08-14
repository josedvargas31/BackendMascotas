import { pool } from "../database/conexion.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
// import { validationResult } from "express-validator";

// listar usuarios
export const listarUsuarios = async (req, res) => {
	try {
		const [result] = await pool.query("SELECT * FROM usuarios");
		if (result.length > 0) {
				res.status(200).json(result);
		} else {
			res.status(403).json({
				status: 403,
				message: "No hay usuarios para listar",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Registrar Usuario
export const registrarUsuario = async (req, res) => {
	try {
		// Desestructurar datos del cuerpo de la solicitud
		const {
			nombre,
			apellido,
			direccion,
			telefono,
			correo,
			tipo_documento,
			documento_identidad,
			password,
			rol,
		} = req.body;
		const img = req.file ? req.file.filename : null; // Obtener el nombre del archivo de la solicitud

		// Verificar si el correo ya está registrado
		const [correoExistente] = await pool.query(
			"SELECT * FROM usuarios WHERE correo = ?",
			[correo]
		);

		if (correoExistente.length > 0) {
			return res.status(400).json({
				status: 400,
				message: "El correo ya está registrado",
			});
		}

		// Verificar si el documento de identidad ya está registrado
		const [documentoExistente] = await pool.query(
			"SELECT * FROM usuarios WHERE documento_identidad = ?",
			[documento_identidad]
		);

		if (documentoExistente.length > 0) {
			return res.status(400).json({
				status: 400,
				message: "El documento de identidad ya está registrado",
			});
		}

		// Cifrar la contraseña antes de guardarla
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Insertar datos en la tabla Usuarios
		const [result] = await pool.query(
			"INSERT INTO usuarios (nombre, apellido, direccion, telefono, correo, tipo_documento, documento_identidad, password, img, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				nombre,
				apellido,
				direccion,
				telefono,
				correo,
				tipo_documento,
				documento_identidad,
				hashedPassword, // Guardar la contraseña encriptada
				img,
				rol,
			]
		);

		// Verificar si la inserción fue exitosa
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Usuario registrado exitosamente",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se pudo registrar el usuario",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor: " + error.message,
		});
	}
};

// Actualizar Usuario
export const actualizarUsuario = async (req, res) => {
	try {
		const { id_usuario } = req.params;
		const {
			nombre,
			apellido,
			direccion,
			telefono,
			correo,
			tipo_documento,
			documento_identidad,
			password,
			rol,
		} = req.body;
		const img = req.file ? req.file.filename : null; // Obtener el nombre del archivo de la solicitud

		// Obtener el usuario actual
		const [currentUsuario] = await pool.query(
			"SELECT img, password FROM usuarios WHERE id_usuario=?",
			[id_usuario]
		);
		const currentImg = currentUsuario.length > 0 ? currentUsuario[0].img : null;
		const currentPassword =
			currentUsuario.length > 0 ? currentUsuario[0].password : null;

		// Encriptar la nueva contraseña si se proporciona
		const hashedPassword = password
			? await bcrypt.hash(password, 10)
			: currentPassword;

		const [result] = await pool.query(
			"UPDATE usuarios SET nombre=?, apellido=?, direccion=?, telefono=?, correo=?, tipo_documento=?, documento_identidad=?, password=?, img=?, rol=? WHERE id_usuario=?",
			[
				nombre,
				apellido,
				direccion,
				telefono,
				correo,
				tipo_documento,
				documento_identidad,
				hashedPassword,
				img || currentImg,
				rol,
				id_usuario,
			]
		);

		if (result.affectedRows > 0) {
			if (img && currentImg) {
				// Eliminar la imagen anterior del servidor
				fs.unlink(path.join("uploads", currentImg), (err) => {
					if (err)
						console.error("No se pudo eliminar la imagen anterior:", err);
				});
			}

			res.status(200).json({
				status: 200,
				message: "Usuario actualizado exitosamente",
				data: { ...req.body, img: img || currentImg },
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se actualizó el usuario",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor: " + error.message,
		});
	}
};

// Eliminar Usuario por ID
export const eliminarUsuario = async (req, res) => {
	try {
		const { id_usuario } = req.params;
		const [result] = await pool.query(
			"DELETE FROM usuarios WHERE id_usuario=?",
			[id_usuario]
		);
		if (result.affectedRows > 0) {
			res.status(200).json({
				status: 200,
				message: "Usuario eliminado",
			});
		} else {
			res.status(403).json({
				status: 403,
				message: "No se eliminó el usuario",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: "Error en el servidor " + error.message,
		});
	}
};

// Controlador para obtener conteo de mascotas por estado
export const obtenerConteoPorEstado = async (req, res) => {
	try {
		// Consulta para obtener el conteo de mascotas por estado
		const [result] = await pool.query(`
			SELECT rol, COUNT(*) as total
			FROM usuarios
			GROUP BY rol
		`);
  
		res.status(200).json(result);
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: 'Error en el sistema: ' + error.message
		});
	}
  };
// Verificar existencia de correo o documento de identidad
export const verificarExistencia = async (req, res) => {
	try {
		const { tipo, valor } = req.params;

		let query;
		let params;

		// Determinar la consulta SQL y los parámetros basados en el tipo de verificación
		if (tipo === "correo") {
			query = "SELECT COUNT(*) AS existe FROM usuarios WHERE correo = ?";
			params = [valor];
		} else if (tipo === "documento_identidad") {
			query =
				"SELECT COUNT(*) AS existe FROM usuarios WHERE documento_identidad = ?";
			params = [valor];
		} else {
			return res.status(400).json({ error: "Tipo de verificación no válido" });
		}

		// Consultar en la base de datos si el valor existe
		const [result] = await pool.query(query, params);

		// Enviar respuesta basada en el resultado de la consulta
		res.json({ existe: result[0].existe > 0 });
	} catch (error) {
		console.error("Error al verificar existencia:", error);
		res.status(500).json({ error: "Error en el servidor" });
	}
};
