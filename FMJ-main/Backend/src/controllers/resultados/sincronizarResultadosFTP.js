import crypto from "crypto";
import Resultado from "../../models/Resultado.js";
import { listarArchivosFTP, leerArchivoFTP } from "../../config/ftp.js";

function generarHash(contenido) {
  return crypto.createHash("sha256").update(contenido).digest("hex");
}

function limpiarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/20\d{2}/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function obtenerDatosDesdeRuta(rutaFTP) {
  const partes = rutaFTP.split("/").filter(Boolean);
  const indexResultados = partes.indexOf("resultados");

  const carpetaFTP = partes[indexResultados + 1] || "sin-torneo";

  const matchAnio = carpetaFTP.match(/(20\d{2})/);
  const anio = matchAnio ? Number(matchAnio[1]) : new Date().getFullYear();

  const nombreSinAnio = carpetaFTP
    .replace(/20\d{2}/g, "")
    .replace(/[-_]+$/g, "")
    .trim();

  const torneoSlug = limpiarSlug(nombreSinAnio || carpetaFTP);

  const torneoNombre = torneoSlug
    .split("-")
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

  return { carpetaFTP, torneoSlug, torneoNombre, anio };
}

const sincronizarResultadosFTP = async (req, res) => {
  try {
    const archivos = await listarArchivosFTP();

    const archivosHTML = archivos.filter((archivo) => {
      const nombre = archivo.nombre.toLowerCase();
      return nombre.endsWith(".html") || nombre.endsWith(".htm");
    });

    let creados = 0;
    let actualizados = 0;
    let sinCambios = 0;
    const errores = [];

    for (const archivo of archivosHTML) {
      try {
        const contenido = await leerArchivoFTP(archivo.ruta);
        const hashArchivo = generarHash(contenido);

        const existente = await Resultado.findOne({ rutaFTP: archivo.ruta });

        if (existente && existente.hashArchivo === hashArchivo) {
          sinCambios++;
          continue;
        }

        const datosRuta = obtenerDatosDesdeRuta(archivo.ruta);

        if (existente) {
          existente.hashArchivo = hashArchivo;
          existente.contenidoOriginal = contenido;
          existente.importadoEn = new Date();
          existente.torneoSlug = datosRuta.torneoSlug;
          existente.torneoNombre = datosRuta.torneoNombre;
          existente.anio = datosRuta.anio;
          existente.carpetaFTP = datosRuta.carpetaFTP;

          await existente.save();
          actualizados++;
        } else {
          await Resultado.create({
            ...datosRuta,
            archivoNombre: archivo.nombre,
            rutaFTP: archivo.ruta,
            hashArchivo,
            tipoArchivo: "html",
            contenidoOriginal: contenido,
          });

          creados++;
        }
      } catch (error) {
        errores.push({
          archivo: archivo.ruta,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      mensaje: "Sincronización FTP finalizada",
      totalEncontrados: archivos.length,
      htmlEncontrados: archivosHTML.length,
      creados,
      actualizados,
      sinCambios,
      errores,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error sincronizando FTP",
      error: error.message,
    });
  }
};

export default sincronizarResultadosFTP;