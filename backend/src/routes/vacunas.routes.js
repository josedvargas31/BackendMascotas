import { Router } from "express";
import { listarVacunas, registrarVacuna, actualizarVacuna, eliminarVacuna, buscarVacuna } from "../controllers/vacunas.controller.js";
import { validarToken } from "../controllers/validacion.controller.js";

const vacunaRoutes = Router();

vacunaRoutes.get("/listar/:id_mascota", validarToken, listarVacunas);
vacunaRoutes.post("/registrar", validarToken, registrarVacuna);
vacunaRoutes.put("/actualizar/:id_vacuna", validarToken, actualizarVacuna);
vacunaRoutes.delete("/eliminar/:id_vacuna", validarToken, eliminarVacuna);
vacunaRoutes.get("/buscar/:id_vacuna", validarToken, buscarVacuna);

export default vacunaRoutes;