import { pool } from "../database/conexion.js";
// import { validationResult } from "express-validator";

// Listar Vacunas
export const listarVacunas = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM vacunas");
    res.status(200).json({
      status: 200,
      message: "Lista de vacunas",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Registrar Vacuna
export const registrarVacuna = async (req, res) => {
  try {
    const { fk_id_mascota, fecha_vacuna, enfermedad, estado } = req.body;
    const [result] = await pool.query(
      "INSERT INTO Vacunas (fk_id_mascota, fecha_vacuna, enfermedad, estado) VALUES (?, ?, ?, ?)",
      [fk_id_mascota, fecha_vacuna, enfermedad, estado]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Vacuna registrada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se registró la vacuna",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Actualizar Vacuna por ID
export const actualizarVacuna = async (req, res) => {
  try {
    const { id_vacuna } = req.params;
    const { fk_id_mascota, fecha_vacuna, enfermedad, estado } = req.body;
    const [result] = await pool.query(
      "UPDATE vacunas SET fk_id_mascota=?, fecha_vacuna=?, enfermedad=?, estado=? WHERE id_vacuna=?",
      [fk_id_mascota, fecha_vacuna, enfermedad, estado, id_vacuna]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Vacuna actualizada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se actualizó la vacuna",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Eliminar Vacuna por ID
export const eliminarVacuna = async (req, res) => {
  try {
    const { id_vacuna } = req.params;
    const [result] = await pool.query("DELETE FROM vacunas WHERE id_vacuna=?", [id_vacuna]);
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Vacuna eliminada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se eliminó la vacuna",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Buscar Vacuna por ID
export const buscarVacuna = async (req, res) => {
  try {
    const { id_vacuna } = req.params;
    const [result] = await pool.query("SELECT * FROM vacunas WHERE id_vacuna=?", [id_vacuna]);
    if (result.length > 0) {
      res.status(200).json({
        status: 200,
        message: "Vacuna encontrada",
        data: result[0],
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "Vacuna no encontrada",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};
