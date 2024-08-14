import { pool } from "../database/conexion.js";
import fs from "fs";
import path from "path";
// import { validationResult } from "express-validator";

// Listar Mascotas
export const listarMascotas = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM mascotas");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Registrar Mascota
export const registrarMascota = async (req, res) => {
  try {
    const { nombre, fecha_nacimiento, estado, descripcion, esterilizado, tamano, peso, fk_id_categoria, fk_id_raza, fk_id_departamento, fk_id_municipio } = req.body;
    const files = req.files; // Obtener los archivos de la solicitud

    // Insertar la nueva mascota
    const [result] = await pool.query(
      "INSERT INTO mascotas (nombre, fecha_nacimiento, estado, descripcion, esterilizado, tamano, peso, fk_id_categoria, fk_id_raza, fk_id_departamento, fk_id_municipio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [nombre, fecha_nacimiento, estado, descripcion, esterilizado, tamano, peso, fk_id_categoria, fk_id_raza, fk_id_departamento, fk_id_municipio]
    );

    const idMascota = result.insertId; // Obtener el ID de la nueva mascota

    // Si se suben imágenes, insertarlas en la tabla imagenes
    if (files && files.length > 0) {
      const imageQueries = files.map(file =>
        pool.query(
          "INSERT INTO imagenes (fk_id_mascota, ruta_imagen) VALUES (?, ?)",
          [idMascota, file.filename]
        )
      );
      await Promise.all(imageQueries); // Ejecutar todas las consultas de inserción
    }

    res.status(200).json({
      status: 200,
      message: "Mascota registrada",
      data: {
        idMascota,
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
        fk_id_municipio
      }
    });
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
          SELECT estado, COUNT(*) as total
          FROM mascotas
          GROUP BY estado
      `);

      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({
          status: 500,
          message: 'Error en el sistema: ' + error.message
      });
  }
};

// Actualizar Mascota por ID
export const actualizarMascota = async (req, res) => {
  try {
    const { id_mascota } = req.params;
    const { nombre, fecha_nacimiento, estado, descripcion, esterilizado, tamano, peso, fk_id_categoria, fk_id_raza, fk_id_departamento, fk_id_municipio } = req.body;
    const nuevaFotografia = req.file ? req.file.filename : null;

    // Obtener la mascota actual
    const [currentMascota] = await pool.query(
      "SELECT img FROM Mascotas WHERE id_mascota=?",
      [id_mascota]
    );
    const fotoActual = currentMascota.length > 0 ? currentMascota[0].img : null;

    // Actualizar la mascota
    const [result] = await pool.query(
      "UPDATE Mascotas SET nombre=?, fecha_nacimiento=?, estado=?, descripcion=?, esterilizado=?, tamano=?, peso=?, fk_id_categoria=?, fk_id_raza=?, fk_id_departamento=?, fk_id_municipio=?, img=? WHERE id_mascota=?",
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
        nuevaFotografia || fotoActual,
        id_mascota,
      ]
    );

    if (result.affectedRows > 0) {
      if (nuevaFotografia && fotoActual) {
        // Eliminar la imagen anterior del servidor
        fs.unlink(path.join("uploads", fotoActual), (err) => {
          if (err) console.error("No se pudo eliminar la imagen anterior:", err);
        });
      }

      res.status(200).json({
        status: 200,
        message: "Mascota actualizada",
        data: {
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
          img: nuevaFotografia || fotoActual
        }
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se actualizó la mascota",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Eliminar Mascota por ID
export const eliminarMascota = async (req, res) => {
  try {
    const { id_mascota } = req.params;
    const [result] = await pool.query("DELETE FROM Mascotas WHERE id_mascota=?", [id_mascota]);
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
    const [result] = await pool.query("SELECT * FROM Mascotas WHERE id_mascota=?", [id_mascota]);
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
