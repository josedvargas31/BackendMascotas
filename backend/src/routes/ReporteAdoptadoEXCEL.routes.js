import express from 'express';
import { generarReporte } from '../controllers/ReporteAdoptadoControllerexcel.js';

const ReporteAdoptadoEXCELrouter = express.Router();

// Ruta para generar el reporte de adopciones
ReporteAdoptadoEXCELrouter.get('/reporte_excel', generarReporte);

export default ReporteAdoptadoEXCELrouter;
