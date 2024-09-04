import { Router } from "express";
import { generarReporte } from "../controllers/ReporteAdopcionControllerpdf.js";

const ReporteAdopcionPDFrouter = Router();
ReporteAdopcionPDFrouter.get("/reporte_pdf", generarReporte);

export default ReporteAdopcionPDFrouter;
