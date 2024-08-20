import { Router } from "express";
import { listarDepartamentos, registrarDepartamento, actualizarDepartamento, eliminarDepartamento, buscarDepartamento } from "../controllers/departamentos.cotroller.js";
import { validarToken } from "../controllers/validacion.controller.js";

const DepartamentoRoutes = Router();

DepartamentoRoutes.get("/listar", validarToken, listarDepartamentos);
DepartamentoRoutes.post("/registrar", validarToken, registrarDepartamento);
DepartamentoRoutes.put("/actualizar/:id_departamento", validarToken, actualizarDepartamento);
DepartamentoRoutes.delete("/eliminar/:id_departamento", validarToken, eliminarDepartamento);
DepartamentoRoutes.get("/buscar/:id_departamento", validarToken, buscarDepartamento);

export default DepartamentoRoutes;