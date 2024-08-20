import { Router } from "express";
import { listarMunicipios, registrarMunicipio, actualizarMunicipio, eliminarMunicipio, buscarMunicipio } from "../controllers/municipios.controller.js";
import { validarToken } from "../controllers/validacion.controller.js";

const MunicipioRoutes = Router();

MunicipioRoutes.get("/listar", validarToken, listarMunicipios);
MunicipioRoutes.post("/registrar", validarToken, registrarMunicipio);
MunicipioRoutes.put("/actualizar/:id_municipio", validarToken, actualizarMunicipio);
MunicipioRoutes.delete("/eliminar/:id_municipio", validarToken, eliminarMunicipio);
MunicipioRoutes.get("/buscar/:id_municipio", validarToken, buscarMunicipio);

export default MunicipioRoutes;