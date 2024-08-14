import { Router } from "express";
import { listarMascotas, registrarMascota, actualizarMascota, eliminarMascota, buscarMascota, obtenerConteoPorEstado } from "../controllers/mascotas.controller.js";
import upload from '../config/multer.config.js'; 
import { uploadImage } from "../config/imagenes.controller.js";

const MascotaRoutes = Router();

MascotaRoutes.get("/listar", listarMascotas);
MascotaRoutes.post("/registrar",  upload.single('img'), uploadImage, registrarMascota);
MascotaRoutes.get('/conteo/estado', obtenerConteoPorEstado);
MascotaRoutes.put("/actualizar/:id_mascota",  upload.single('img'), uploadImage, actualizarMascota);
MascotaRoutes.delete("/eliminar/:id_mascota", eliminarMascota);
MascotaRoutes.get("/buscar/:id_mascota", buscarMascota);

export default MascotaRoutes;