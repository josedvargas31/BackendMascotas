import { Router } from "express";
import { listarMascotas, registrarMascota, actualizarMascota, eliminarMascota, buscarMascota, obtenerConteoPorEstado, /* iniciarAdopcion, administrarAdopcion, listarMascotasConUsuarios */ } from "../controllers/mascotas.controller.js";
import upload from '../config/multer.config.js'; 
import { uploadImage } from "../config/imagenes.controller.js";
import { validarToken } from "../controllers/validacion.controller.js";

const MascotaRoutes = Router();

MascotaRoutes.get("/listar",  validarToken, listarMascotas);
MascotaRoutes.post("/registrar",  validarToken,  upload.array('imagenes', 4), uploadImage, registrarMascota);
MascotaRoutes.get('/conteo/estado', validarToken, obtenerConteoPorEstado);
MascotaRoutes.put("/actualizar/:id_mascota", /* validarToken, */  upload.array('imagenes', 4), uploadImage, actualizarMascota);
MascotaRoutes.delete("/eliminar/:id_mascota", validarToken, eliminarMascota);
MascotaRoutes.get("/buscar/:id_mascota", validarToken, buscarMascota);
/*  */
// MascotaRoutes.post('/iniciar/:id_mascota', iniciarAdopcion);
// MascotaRoutes.post('/administrar/:id_adopcion', administrarAdopcion);
// MascotaRoutes.get('/listarConUsuarios', listarMascotasConUsuarios);

export default MascotaRoutes;