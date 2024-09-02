// controllers/reporteController.js
import { pool } from "../database/conexion.js";
import PDFDocument from "pdfkit";
import moment from "moment";
import fs from 'fs';
import path from 'path';
import { Writable } from "stream";

// Función para generar el PDF
const generatePDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            let buffers = [];

            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            const calculateAgeInMonths = (birthdate) => {
                const birth = new Date(birthdate);
                const now = new Date();
            
                const years = now.getFullYear() - birth.getFullYear();
                const months = now.getMonth() - birth.getMonth();
            
                return years * 12 + months;
            };
            
            // Define las constantes del margen
            const margin = 50;
            const imageSize = 60;
            const textFontSize = 10;
            const imagePath = path.resolve('uploads/img-1723413097559-796545287.png');

            // Función para dibujar el margen
            const drawMargin = () => {
                doc
                    .strokeColor('#dc7633')
                    .lineWidth(1)
                    .rect(margin, margin, doc.page.width - 2 * margin, doc.page.height - 2 * margin)
                    .stroke();
            };

            // Función para dibujar la imagen y el texto
            const drawImageAndText = () => {
                if (fs.existsSync(imagePath)) {
                    const img = doc.openImage(imagePath);
                    const imageHeight = img.height / img.width * imageSize; // Calcula la altura de la imagen ajustada

                    doc.image(imagePath, {
                        fit: [imageSize, imageSize],
                        align: 'center',
                        valign: 'top',
                        x: margin + 6, // Ajusta la posición horizontal de la imagen
                        y: margin + 10  // Ajusta la posición vertical de la imagen
                    });

                    doc
                        .fontSize(textFontSize)
                        .fillColor('black')
                        .font('Helvetica')
                        .text('Purrfect Match', 
                            margin + 6 + 4,  // Ajusta la posición horizontal del texto
                            margin + imageHeight + 10 - 5); // Ajusta la posición vertical del texto
                } else {
                    console.error('Archivo de imagen no encontrado:', imagePath);
                }
            };
          

            // Llama a drawMargin y drawImageAndText en la primera página
            drawMargin();
            drawImageAndText();

            // Añadir evento para cuando se agregue una nueva página
            doc.on('pageAdded', () => {
                drawMargin();
                drawImageAndText();
            });
            doc.moveDown();
            doc.moveDown();
            // Diseño del PDF
            doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .fillColor('black')
            .text("Reporte de Mascotas en Adopción", { align: "center" });

            // Encabezados
            doc.fontSize(12).text(`Fecha de Generación: ${moment().format("YYYY-MM-DD")}`, { align: "center" });
            doc.moveDown();
            doc.moveDown();

            // Tabla de Datos
            data.forEach((mascota, index) => {
                const edadEnMeses = calculateAgeInMonths(mascota.fecha_nacimiento);
            
                doc.fontSize(12)
                   .fillColor('#333333')
                   .text(`${index + 1}. Nombre: ${mascota.nombre_mascota}`);
                doc.text(`   Fecha de Nacimiento: ${moment(mascota.fecha_nacimiento).format("YYYY-MM-DD")}`);
                doc.text(`   Edad: ${edadEnMeses} meses`); // Agrega la edad en meses
                doc.text(`   Categoría: ${mascota.nombre_categoria}`);
                doc.text(`   Raza: ${mascota.nombre_raza}`);
                doc.text(`   Estado: ${mascota.estado}`);
                doc.text(`   Descripción: ${mascota.descripcion}`);
                doc.moveDown();
            });
            

// Define la función para dibujar el pie de página
const drawFooter = () => {
    const fixedXPosition = 474;
    const fixedYPosition = doc.page.height - 84;

    if (fs.existsSync(imagePath)) {
        doc.image(imagePath, {
            fit: [60, 60],
            align: 'center',
            valign: 'top',
            x: fixedXPosition,
            y: fixedYPosition - 60
        });
    } else {
        console.error('Archivo de imagen no encontrado:', imagePath);
    }

    doc
        .fontSize(10)
        .fillColor('black')
        .font('Helvetica')
        .text('Purrfect Match', fixedXPosition, fixedYPosition);
};

// Llama a drawMargin, drawImageAndText, y drawFooter en la primera página
drawMargin();
drawImageAndText();
drawFooter();

// Añadir evento para cuando se agregue una nueva página
doc.on('pageAdded', () => {
    drawMargin();
    drawImageAndText();
    drawFooter();
});


            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};



// Controlador para generar el reporte
export const generarReporte = async (req, res) => {
  try {
    const { tipo_fecha, fecha_inicio, fecha_fin, categoria, raza } = req.query;

    // Validación de parámetros
    if (!tipo_fecha || (tipo_fecha === "rango" && (!fecha_inicio || !fecha_fin))) {
      return res.status(400).json({
        status: 400,
        message: "Parámetros de fecha insuficientes",
      });
    }

    // Construir la consulta SQL con filtros
    let query = `
      SELECT 
        m.nombre_mascota, 
        m.fecha_nacimiento, 
        c.nombre_categoria, 
        r.nombre_raza, 
        m.estado, 
        m.descripcion
      FROM mascotas m
      INNER JOIN categorias c ON m.fk_id_categoria = c.id_categoria
      INNER JOIN razas r ON m.fk_id_raza = r.id_raza
      WHERE m.estado IN ('En Adopcion', 'Urgente')
    `;
    let params = [];

    // Filtrar por fecha
    if (tipo_fecha === "dia") {
      query += " AND DATE(m.fecha_nacimiento) = ?";
      params.push(fecha_inicio);
    } else if (tipo_fecha === "mes") {
      query += " AND MONTH(m.fecha_nacimiento) = ? AND YEAR(m.fecha_nacimiento) = ?";
      const [mes, año] = fecha_inicio.split("-");
      params.push(mes, año);
    } else if (tipo_fecha === "rango") {
      query += " AND DATE(m.fecha_nacimiento) BETWEEN ? AND ?";
      params.push(fecha_inicio, fecha_fin);
    }

    // Filtrar por categoría
    if (categoria) {
      query += " AND c.id_categoria = ?";
      params.push(categoria);
    }

    // Filtrar por raza
    if (raza) {
      query += " AND r.id_raza = ?";
      params.push(raza);
    }

    const [result] = await pool.query(query, params);

    if (result.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No se encontraron mascotas con los filtros proporcionados",
      });
    }

    // Generar el PDF
    const pdfBuffer = await generatePDF(result);

    // Configurar las cabeceras para la descarga del PDF
    res.setHeader("Content-Disposition", `attachment; filename=Reporte_Mascotas_${Date.now()}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    res.status(500).json({
      status: 500,
      message: "Error en el servidor: " + error.message,
    });
  }
};
