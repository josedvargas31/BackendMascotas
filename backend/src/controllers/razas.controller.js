import { pool } from "../database/conexion.js";
// import { validationResult } from "express-validator";

// Listar Razas
export const listarRazas = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM Razas");
    res.status(200).json({
      status: 200,
      message: "Lista de razas",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Registrar Raza
export const registrarRaza = async (req, res) => {
  try {
    const { nombre, fk_id_categoria } = req.body;
    const [result] = await pool.query("INSERT INTO Razas (nombre, fk_id_categoria) VALUES (?, ?)", [nombre, fk_id_categoria]);
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Raza registrada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se registró la raza",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Actualizar Raza por ID
export const actualizarRaza = async (req, res) => {
  try {
    const { id_raza } = req.params;
    const { nombre, fk_id_categoria } = req.body;
    const [result] = await pool.query("UPDATE Razas SET nombre=?, fk_id_categoria=? WHERE id_raza=?", [nombre, fk_id_categoria, id_raza]);
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Raza actualizada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se actualizó la raza",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Eliminar Raza por ID
export const eliminarRaza = async (req, res) => {
  try {
    const { id_raza } = req.params;
    const [result] = await pool.query("DELETE FROM Razas WHERE id_raza=?", [id_raza]);
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Raza eliminada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se eliminó la raza",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Buscar Raza por ID
export const buscarRaza = async (req, res) => {
  try {
    const { id_raza } = req.params;
    const [result] = await pool.query("SELECT * FROM Razas WHERE id_raza=?", [id_raza]);
    if (result.length > 0) {
      res.status(200).json({
        status: 200,
        message: "Raza encontrada",
        data: result[0],
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "Raza no encontrada",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};
