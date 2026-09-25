import * as ftp from "basic-ftp";
import { Writable, Readable } from "stream";

function obtenerConfig() {
  return {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    port: Number(process.env.FTP_PORT) || 21,
    secure: false,
  };
}

export async function conectarFTP() {
  const client = new ftp.Client();
  client.ftp.timeout = 10000;
  await client.access(obtenerConfig());
  return client;
}

export async function crearCarpetaResultadoTorneo(folderSlug) {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;

  try {
    await client.access(obtenerConfig());

    // Nos ubicamos obligatoriamente en la raíz absoluta del servidor FTP
    await client.cd("/");

    const baseDir = process.env.FTP_BASE_DIR || "domains/mediumaquamarine-pelican-819722.hostingersite.com/public_html/resultados";
    const targetPath = `${baseDir}/${folderSlug}`;

    // Aseguramos la creación de la carpeta del torneo paso a paso o mediante la ruta completa limpia
    await client.ensureDir(targetPath);

    // Contenido HTML de prueba para el index.html
    const contenidoPrueba = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Resultados del Torneo - ${folderSlug}</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; background-color: #f4f4f9; color: #333; }
        h1 { color: #2c3e50; }
        p { font-size: 1.2rem; }
    </style>
</head>
<body>
    <h1>🏆 Resultados del Torneo: ${folderSlug}</h1>
    <p>¡Carpeta sincronizada correctamente con el backend de Node.js!</p>
</body>
</html>`;

    const streamPrueba = Readable.from([contenidoPrueba]);
    await client.uploadFrom(streamPrueba, `${targetPath}/index.html`);

    console.log(`[FTP Success] Carpeta e index.html creados en: ${targetPath}`);

    return {
      success: true,
      path: targetPath,
    };
  } catch (error) {
    console.error("[FTP Error] Error al crear la carpeta o subir archivo:", error.message);
    throw error;
  } finally {
    client.close();
  }
}

export async function borrarCarpetaResultadoTorneo(slug) {
  const client = new ftp.Client();
  try {
    await client.access(obtenerConfig());
    await client.cd("/");
    const baseDir = process.env.FTP_BASE_DIR || "domains/mediumaquamarine-pelican-819722.hostingersite.com/public_html/resultados";
    await client.removeDir(`${baseDir}/${slug}`);
    console.log(`[FTP Success] Carpeta eliminada: ${baseDir}/${slug}`);
  } catch (err) {
    console.error("[FTP Error] Error al eliminar carpeta:", err.message);
  } finally {
    client.close();
  }
}

export async function listarArchivosFTP(slug) {
  const client = new ftp.Client();
  try {
    await client.access(obtenerConfig());
    await client.cd("/");
    const baseDir = process.env.FTP_BASE_DIR || "domains/mediumaquamarine-pelican-819722.hostingersite.com/public_html/resultados";
    return await client.list(`${baseDir}/${slug}`);
  } catch (err) {
    return [];
  } finally {
    client.close();
  }
}

export async function leerArchivoFTP(slug, nombreArchivo) {
  const client = new ftp.Client();
  try {
    await client.access(obtenerConfig());
    await client.cd("/");
    const baseDir = process.env.FTP_BASE_DIR || "domains/mediumaquamarine-pelican-819722.hostingersite.com/public_html/resultados";
    
    let data = "";
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        data += chunk.toString();
        callback();
      },
    });
    await client.downloadTo(writableStream, `${baseDir}/${slug}/${nombreArchivo}`);
    return data;
  } catch (err) {
    return null;
  } finally {
    client.close();
  }
}