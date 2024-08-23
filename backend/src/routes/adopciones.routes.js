import { Router } from "express";
import { listarAdopciones, registrarAdopcion, actualizarAdopcion, eliminarAdopcion, buscarAdopcion, iniciarAdopcion, administrarAdopcion } from "../controllers/adopciones.controller.js";
import { validarToken } from "../controllers/validacion.controller.js";

const AdopcionRoutes = Router();

AdopcionRoutes.get("/listar", /* validarToken, */ listarAdopciones);
AdopcionRoutes.post("/registrar", validarToken, registrarAdopcion);
AdopcionRoutes.put("/actualizar/:id_adopcion", validarToken, actualizarAdopcion);
AdopcionRoutes.delete("/eliminar/:id_adopcion", validarToken, eliminarAdopcion);
AdopcionRoutes.get("/buscar/:id_adopcion", validarToken, buscarAdopcion);
/*  */
AdopcionRoutes.post('/iniciar/:id_mascota', iniciarAdopcion);
AdopcionRoutes.post('/administrar/:id_adopcion', administrarAdopcion);

export default AdopcionRoutes;