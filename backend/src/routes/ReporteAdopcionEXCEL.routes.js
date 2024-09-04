import { Router } from "express";
import { generarReporte } from "../controllers/ReporteAdopcionControllerexcel.js";

const ReporteAdopcionEXCELrouter = Router();
ReporteAdopcionEXCELrouter.get("/reporte_excel", generarReporte);

export default ReporteAdopcionEXCELrouter;
