import { pool } from "../database/conexion.js";
import { validationResult } from "express-validator";

// Listar Adopciones
// Controlador para listar mascotas con usuarios asociados en proceso de adopción
export const listarAdopciones = async (req, res) => {
  try {
    // Ejecutar la consulta SQL
    const [result] = await pool.query(`
      SELECT 
        m.id_mascota, 
        m.nombre_mascota, 
        m.fecha_nacimiento, 
        m.descripcion, 
        m.esterilizado, 
        m.tamano, 
        m.peso, 
        m.fk_id_categoria, 
        r.nombre_raza AS raza,
        m.fk_id_departamento, 
        m.fk_id_municipio, 
        m.sexo,
        u.id_usuario, 
        u.nombre AS usuario_nombre, 
        u.apellido AS usuario_apellido, 
        u.correo AS usuario_correo,
        u.telefono AS usuario_telefono,
        a.id_adopcion, 
        a.estado AS estado_adopcion,
        i.ruta_imagen
      FROM mascotas m
      JOIN adopciones a ON m.id_mascota = a.fk_id_mascota
      JOIN usuarios u ON a.fk_id_usuario_adoptante = u.id_usuario
      JOIN razas r ON m.fk_id_raza = r.id_raza
      LEFT JOIN imagenes i ON m.id_mascota = i.fk_id_mascota
      WHERE m.estado = 'Reservado' AND a.estado = 'proceso de adopcion'
    `);

    // Agrupar los resultados por mascota
    const adopciones = result.reduce((acc, item) => {
      const { id_mascota, nombre_mascota, fecha_nacimiento, descripcion, esterilizado, tamano, peso, fk_id_categoria, fk_id_departamento, fk_id_municipio, sexo, raza, id_usuario, usuario_nombre, usuario_apellido, usuario_correo, usuario_telefono, id_adopcion, estado_adopcion, ruta_imagen } = item;

      // Verificar si la mascota ya está en el acumulador
      if (!acc[id_mascota]) {
        acc[id_mascota] = {
          id_mascota,
          nombre_mascota,
          fecha_nacimiento,
          descripcion,
          esterilizado,
          tamano,
          peso,
          fk_id_categoria,
          raza,
          fk_id_departamento,
          fk_id_municipio,
          sexo,
          usuario: {
            id_usuario,
            nombre: usuario_nombre,
            apellido: usuario_apellido,
            correo: usuario_correo,
            telefono: usuario_telefono
          },
          id_adopcion,
          estado_adopcion,
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
    const adopcionesArray = Object.values(adopciones);

    // Enviar la respuesta
    res.status(200).json(adopcionesArray);
  } catch (error) {
    console.error('Error al listar mascotas con usuarios:', error); // Registro del error en la consola del servidor
    res.status(500).json({
      status: 500,
      message: 'Error en el sistema: ' + error.message
    });
  }
};

// Controlador para iniciar el proceso de adopción
export const iniciarAdopcion = async (req, res) => {
  try {
      // Validar los datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      // Obtener parámetros y cuerpo de la solicitud
      const { id_mascota } = req.params;
      const { id_usuario } = req.body;

      // Verificar si el usuario existe
      const [usuarioResult] = await pool.query("SELECT id_usuario FROM usuarios WHERE id_usuario = ?", [id_usuario]);
      if (usuarioResult.length === 0) {
          return res.status(404).json({
              status: 404,
              message: 'No se encontró el usuario'
          });
      }

      // Verificar si la mascota existe y su estado actual
      const [mascotaResult] = await pool.query("SELECT estado FROM mascotas WHERE id_mascota = ?", [id_mascota]);

      if (mascotaResult.length > 0) {
          const estadoMascota = mascotaResult[0].estado;

          // Verificar si la mascota está disponible para adopción
          if (estadoMascota === 'En Adopcion' || estadoMascota === 'Urgente' ) {
              // Iniciar el proceso de adopción
              const [insertAdopcion] = await pool.query(
                  "INSERT INTO adopciones (fk_id_mascota, fk_id_usuario_adoptante, fecha_adopcion, estado) VALUES (?, ?, CURDATE(), 'proceso de adopcion')",
                  [id_mascota, id_usuario]
              );

              // Verificar si la adopción se insertó correctamente
              if (insertAdopcion.affectedRows > 0) {
                  // Actualizar el estado de la mascota
                  await pool.query("UPDATE mascotas SET estado = 'Reservado' WHERE id_mascota = ?", [id_mascota]);
                  res.status(200).json({
                      status: 200,
                      message: 'Proceso de adopción iniciado correctamente'
                  });
              } else {
                  res.status(500).json({
                      status: 500,
                      message: 'No se pudo iniciar el proceso de adopción'
                  });
              }
          } else {
              res.status(400).json({
                  status: 400,
                  message: 'La mascota no está disponible para adopción'
              });
          }
      } else {
          res.status(404).json({
              status: 404,
              message: 'No se encontró la mascota'
          });
      }
  } catch (error) {
      res.status(500).json({
          status: 500,
          message: 'Error en el sistema: ' + error.message
      });
  }
};

// Controlador para administrar la adopción (aceptar o denegar)
export const administrarAdopcion = async (req, res) => {
  try {
      // Validar los datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      // Obtener parámetros y cuerpo de la solicitud
      const { id_adopcion } = req.params;
      const { accion } = req.body;

      // Verificar si la solicitud de adopción existe
      const [adopcionResult] = await pool.query("SELECT * FROM adopciones WHERE id_adopcion = ?", [id_adopcion]);
      if (adopcionResult.length === 0) {
          return res.status(404).json({
              status: 404,
              message: 'No se encontró la solicitud de adopción'
          });
      }

      const adopcion = adopcionResult[0];
      let nuevoEstadoMascota;

      // Procesar la acción solicitada
      if (accion === 'aceptar') {
          nuevoEstadoMascota = 'Adoptado';
          await pool.query("UPDATE adopciones SET estado = 'aceptada' WHERE id_adopcion = ?", [id_adopcion]);
      } else if (accion === 'denegar') {
          nuevoEstadoMascota = 'En Adopcion'; // Estado a recuperar si se deniega la adopción
          await pool.query("UPDATE adopciones SET estado = 'rechazada' WHERE id_adopcion = ?", [id_adopcion]);
      } else {
          return res.status(400).json({
              status: 400,
              message: 'Acción no válida'
          });
      }

      // Actualizar el estado de la mascota
      const [updateResult] = await pool.query("UPDATE mascotas SET estado = ? WHERE id_mascota = ?", [nuevoEstadoMascota, adopcion.fk_id_mascota]);
      if (updateResult.affectedRows > 0) {
          res.status(200).json({
              status: 200,
              message: `La adopción ha sido ${accion === 'aceptar' ? 'aceptada' : 'denegada'}`
          });
      } else {
          res.status(404).json({
              status: 404,
              message: 'No se pudo actualizar el estado de la mascota'
          });
      }
  } catch (error) {
      res.status(500).json({
          status: 500,
          message: 'Error en el sistema: ' + error.message
      });
  }
};

// Registrar Adopcion
export const registrarAdopcion = async (req, res) => {
  try {
    const { fk_id_mascota, fk_id_usuario_adoptante, fecha_adopcion, estado } = req.body;
    const [result] = await pool.query(
      "INSERT INTO adopciones (fk_id_mascota, fk_id_usuario_adoptante, fecha_adopcion, estado) VALUES (?, ?, ?, ?)",
      [fk_id_mascota, fk_id_usuario_adoptante, fecha_adopcion, estado]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Adopción registrada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se registró la adopción",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Actualizar Adopcion por ID
export const actualizarAdopcion = async (req, res) => {
  try {
    const { id_adopcion } = req.params;
    const { fk_id_mascota, fk_id_usuario_adoptante, fecha_adopcion, estado } = req.body;
    const [result] = await pool.query(
      "UPDATE adopciones SET fk_id_mascota=?, fk_id_usuario_adoptante=?, fecha_adopcion=?, estado=? WHERE id_adopcion=?",
      [fk_id_mascota, fk_id_usuario_adoptante, fecha_adopcion, estado, id_adopcion]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Adopción actualizada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se actualizó la adopción",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Eliminar Adopcion por ID
export const eliminarAdopcion = async (req, res) => {
  try {
    const { id_adopcion } = req.params;
    const [result] = await pool.query("DELETE FROM adopciones WHERE id_adopcion=?", [id_adopcion]);
    if (result.affectedRows > 0) {
      res.status(200).json({
        status: 200,
        message: "Adopción eliminada",
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "No se eliminó la adopción",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};

// Buscar Adopcion por ID
export const buscarAdopcion = async (req, res) => {
  try {
    const { id_adopcion } = req.params;
    const [result] = await pool.query("SELECT * FROM adopciones WHERE id_adopcion=?", [id_adopcion]);
    if (result.length > 0) {
      res.status(200).json({
        status: 200,
        message: "Adopción encontrada",
        data: result[0],
      });
    } else {
      res.status(403).json({
        status: 403,
        message: "Adopción no encontrada",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error en el servidor " + error.message,
    });
  }
};
