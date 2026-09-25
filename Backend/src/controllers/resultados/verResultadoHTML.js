// controllers/resultados/verResultadoDirecto.js
import { conectarFTP, leerArchivoFTP } from "../../config/ftp.js";

const verResultadoDirecto = async (req, res) => {
  try {
    const { slug } = req.params;
    const baseDir = process.env.FTP_BASE_DIR || "/domains/mediumaquamarine-pelican-819722.hostingersite.com/public_html/resultados";
    const carpetaTorneo = `${baseDir}/${slug}`.replaceAll("//", "/");

    const client = await conectarFTP();
    
    // 1. Listar los archivos dentro de la carpeta del torneo
    let items = [];
    try {
      items = await client.list(carpetaTorneo);
    } finally {
      client.close();
    }

    console.log(`📁 Archivos encontrados en ${carpetaTorneo}:`, items.map(i => i.name));

    // 2. Buscar si existe un index.html o cualquier .html
    const archivoHtml = items.find(i => i.name.toLowerCase().endsWith(".html") || i.name.toLowerCase().endsWith(".htm"));

    if (!archivoHtml) {
      return res.status(404).send(`<h1>404 - Carpeta encontrada, pero no contiene ningún archivo .html</h1><p>Contenido: ${items.map(i => i.name).join(", ") || 'Carpeta vacía'}</p>`);
    }

    // 3. Leer el HTML encontrado
    const rutaArchivo = `${carpetaTorneo}/${archivoHtml.name}`.replaceAll("//", "/");
    const htmlContenido = await leerArchivoFTP(rutaArchivo);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(htmlContenido);

  } catch (error) {
    console.error("❌ Error en verResultadoDirecto:", error.message);
    res.status(404).send(`<h1>404 - Error consultando la carpeta del torneo</h1><p>${error.message}</p>`);
  }
};

export default verResultadoDirecto;