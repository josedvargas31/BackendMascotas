import { Router } from "express";
import { listarDepartamentos, registrarDepartamento, actualizarDepartamento, eliminarDepartamento, buscarDepartamento } from "../controllers/departamentos.cotroller.js";

const DepartamentoRoutes = Router();

DepartamentoRoutes.get("/listar", listarDepartamentos);
DepartamentoRoutes.post("/registrar", registrarDepartamento);
DepartamentoRoutes.put("/actualizar/:id_departamento", actualizarDepartamento);
DepartamentoRoutes.delete("/eliminar/:id_departamento", eliminarDepartamento);
DepartamentoRoutes.get("/buscar/:id_departamento", buscarDepartamento);

export default DepartamentoRoutes;