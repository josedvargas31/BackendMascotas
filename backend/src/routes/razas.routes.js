import { Router } from "express";
import { listarRazas, registrarRaza, actualizarRaza, eliminarRaza, buscarRaza } from "../controllers/razas.controller.js";

const RazasRoutes = Router();

RazasRoutes.get("/listar", listarRazas);
RazasRoutes.post("/registrar", registrarRaza);
RazasRoutes.put("/actualizar/:id_raza", actualizarRaza);
RazasRoutes.delete("/eliminar/:id_raza", eliminarRaza);
RazasRoutes.get("/buscar/:id_raza", buscarRaza);

export default RazasRoutes;