import { Router } from "express";
import { listarMunicipios, registrarMunicipio, actualizarMunicipio, eliminarMunicipio, buscarMunicipio } from "../controllers/municipios.controller.js";

const MunicipioRoutes = Router();

MunicipioRoutes.get("/listar", listarMunicipios);
MunicipioRoutes.post("/registrar", registrarMunicipio);
MunicipioRoutes.put("/actualizar/:id_municipio", actualizarMunicipio);
MunicipioRoutes.delete("/eliminar/:id_municipio", eliminarMunicipio);
MunicipioRoutes.get("/buscar/:id_municipio", buscarMunicipio);

export default MunicipioRoutes;