import { Router } from "express";
import { listarUsuarios, registrarUsuario, actualizarUsuario, eliminarUsuario, verificarExistencia, obtenerConteoPorEstado, solicitarCambioRol, listarNotificaciones, manejarNotificacion, eliminarNotificacion, Perfil, actualizarPerfilUsuario } from "../controllers/usuarios.controller.js";
// valida por token
import { validarToken } from "../controllers/validacion.controller.js";
import upload from '../config/multer.config.js'; 
import { uploadImage } from "../config/imagenes.controller.js";
const usuarioRoutes = Router();

usuarioRoutes.get("/listar", /* validarToken, */ listarUsuarios);
usuarioRoutes.get('/perfil/:id_usuario', validarToken, upload.single('img'), uploadImage, Perfil);
usuarioRoutes.post('/registrar', validarToken, upload.single('img'), uploadImage, registrarUsuario);
usuarioRoutes.get('/conteo/rol', obtenerConteoPorEstado);
usuarioRoutes.put('/actualizar/:id_usuario', validarToken, upload.single('img'), uploadImage,  actualizarUsuario);
usuarioRoutes.put('/actualizarPerfil/:id_usuario', validarToken, upload.single('img'), uploadImage,  actualizarPerfilUsuario);
usuarioRoutes.delete("/eliminar/:id_usuario", validarToken, eliminarUsuario);
usuarioRoutes.get('/verificar/:tipo/:valor', validarToken, verificarExistencia);
usuarioRoutes.post('/solicitarCambioRol/:id_usuario', validarToken, solicitarCambioRol);
usuarioRoutes.get('/listarNoti/:id_usuario', validarToken, listarNotificaciones);
usuarioRoutes.put('/manejar/:id_notificacion', validarToken, manejarNotificacion);
usuarioRoutes.delete('/eliminarNotificacion/:id_notificacion', validarToken, eliminarNotificacion);

export default usuarioRoutes;