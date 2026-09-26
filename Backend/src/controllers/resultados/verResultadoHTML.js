// controllers/resultados/verResultadoDirecto.js
import { conectarFTP } from "../../config/ftp.js";
import { Writable } from "stream";

const verResultadoDirecto = async (req, res) => {
  const client = new fys_client_placeholder || await conectarFTP();
  try {
    const { slug } = req.params;
    
    // Ruta base estándar absoluta para Hostinger
    const baseDir = process.env.FTP_BASE_DIR || "/domains/mediumaquamarine-pelican-819722.hostingersite.com/public_html/resultados";
    const carpetaTorneo = `${baseDir}/${slug}`.replaceAll("//", "/");

    // 1. Listar los archivos dentro de la carpeta del torneo en el FTP
    let items = [];
    try {
      items = await client.list(carpetaTorneo);
    } catch (err) {
      console.error(`[FTP Error] No se pudo listar la carpeta ${carpetaTorneo}:`, err.message);
    }

    // 2. Buscar si existe un index.html o cualquier archivo .html
    const archivoHtml = items.find(i => i.name && (i.name.toLowerCase().endsWith(".html") || i.name.toLowerCase().endsWith(".htm")));

    if (!archivoHtml) {
      return res.status(404).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
          <h2 style="color: #dc3545;">404 - Resultados no encontrados</h2>
          <p>La carpeta del torneo <b>${slug}</b> existe en el FTP pero no contiene ningún archivo .html.</p>
          <p style="color: #6c757d; font-size: 14px;">Archivos en la carpeta: ${items.map(i => i.name).join(", ") || 'Vacía'}</p>
        </div>
      `);
    }

    // 3. Descargar el contenido del archivo HTML directamente desde el FTP mediante stream
    const rutaArchivoFTP = `${carpetaTorneo}/${archivoHtml.name}`.replaceAll("//", "/");
    
    let contenidoHtml = "";
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        contenidoHtml += chunk.toString();
        callback();
      },
    });

    await client.downloadTo(writableStream, rutaArchivoFTP);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(contenidoHtml);

  } catch (error) {
    console.error("❌ Error en verResultadoDirecto:", error.message);
    res.status(404).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h2 style="color: #dc3545;">404 - Error al cargar los resultados</h2>
        <p>${error.message}</p>
      </div>
    `);
  } finally {
    try {
      client.close();
    } catch (e) {}
  }
};

export default verResultadoDirecto;