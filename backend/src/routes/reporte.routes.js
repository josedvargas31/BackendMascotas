import { Router } from "express";
import { generarReporte } from "../controllers/reporteController.js";

const Reporterouter = Router();
Reporterouter.get("/reporte", generarReporte);

export default Reporterouter;
