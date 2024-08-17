import { Router } from "express";
import { listarUsuarios, registrarUsuario, actualizarUsuario, eliminarUsuario, verificarExistencia, obtenerConteoPorEstado } from "../controllers/usuarios.controller.js";
// valida por token
import { validarToken } from "../controllers/validacion.controller.js";
import upload from '../config/multer.config.js'; 
import { uploadImage } from "../config/imagenes.controller.js";
const usuarioRoutes = Router();

usuarioRoutes.get("/listar", validarToken, listarUsuarios);
usuarioRoutes.post('/registrar', upload.single('img'), uploadImage, registrarUsuario);
usuarioRoutes.get('/conteo/rol', obtenerConteoPorEstado);
usuarioRoutes.put('/actualizar/:id_usuario', validarToken, upload.single('img'), uploadImage,  actualizarUsuario);
usuarioRoutes.delete("/eliminar/:id_usuario", validarToken, eliminarUsuario);
usuarioRoutes.get('/verificar/:tipo/:valor', verificarExistencia);

export default usuarioRoutes;