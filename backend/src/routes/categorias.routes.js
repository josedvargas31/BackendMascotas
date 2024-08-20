import { Router } from "express";
import { listarCategorias, registrarCategoria, actualizarCategoria, eliminarCategoria, buscarCategoria } from "../controllers/categorias.controller.js";
import { validarToken } from "../controllers/validacion.controller.js";

const CategoriaRoutes = Router();

CategoriaRoutes.get("/listar", validarToken, listarCategorias);
CategoriaRoutes.post("/registrar", validarToken, registrarCategoria);
CategoriaRoutes.put("/actualizar/:id_categoria", validarToken, actualizarCategoria);
CategoriaRoutes.delete("/eliminar/:id_categoria", validarToken, eliminarCategoria);
CategoriaRoutes.get("/buscar/:id_categoria", validarToken, buscarCategoria);

export default CategoriaRoutes;