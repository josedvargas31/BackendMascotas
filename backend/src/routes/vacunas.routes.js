import { Router } from "express";
import { listarVacunas, registrarVacuna, actualizarVacuna, eliminarVacuna, buscarVacuna } from "../controllers/vacunas.controller.js";

const vacunaRoutes = Router();

vacunaRoutes.get("/listar", listarVacunas);
vacunaRoutes.post("/registrar", registrarVacuna);
vacunaRoutes.put("/actualizar/:id_vacuna", actualizarVacuna);
vacunaRoutes.delete("/eliminar/:id_vacuna", eliminarVacuna);
vacunaRoutes.get("/buscar/:id_vacuna", buscarVacuna);

export default vacunaRoutes;