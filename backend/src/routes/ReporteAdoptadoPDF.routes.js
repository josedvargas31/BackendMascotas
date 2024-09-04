import express from 'express';
import { generarReporte } from '../controllers/ReporteAdoptadoControllerpdf.js';

const ReporteAdoptadoPDFrouter = express.Router();

// Ruta para generar el reporte de adopciones
ReporteAdoptadoPDFrouter.get('/reporte_pdf', generarReporte);

export default ReporteAdoptadoPDFrouter;
