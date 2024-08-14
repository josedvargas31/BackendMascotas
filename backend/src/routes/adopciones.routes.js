import { Router } from "express";
import { listarAdopciones, registrarAdopcion, actualizarAdopcion, eliminarAdopcion, buscarAdopcion } from "../controllers/adopciones.controller.js";

const AdopcionRoutes = Router();

AdopcionRoutes.get("/listar", listarAdopciones);
AdopcionRoutes.post("/registrar", registrarAdopcion);
AdopcionRoutes.put("/actualizar/:id_adopcion", actualizarAdopcion);
AdopcionRoutes.delete("/eliminar/:id_adopcion", eliminarAdopcion);
AdopcionRoutes.get("/buscar/:id_adopcion", buscarAdopcion);

export default AdopcionRoutes;