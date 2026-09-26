import * as ftp from "basic-ftp";
import { Writable } from "stream";

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
  
  // Imprimimos dónde está parado el FTP exactamente al entrar
  const rutaActual = await client.pwd();
  console.log(`🔍 [FTP DEBUG] El servidor FTP arrancó en la ruta: ${rutaActual}`);

  return client;
}

export async function crearCarpetaResultadoTorneo(folderSlug) {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;

  try {
    await client.access(obtenerConfig());
    
    const rutaActual = await client.pwd();
    console.log(`🔍 [FTP DEBUG] PWD inicial: ${rutaActual}`);

    // Probamos usar la ruta relativa directa desde donde arranca el FTP de Hostinger
    const baseDir = process.env.FTP_BASE_DIR || "domains/mediumaquamarine-pelican-819722.hostingersite.com/public_html/resultados";
    
    // Limpiamos cualquier barra inicial para que respete el directorio base del usuario FTP
    const baseClean = baseDir.replace(/^\/+/, "");
    const targetPath = `${baseClean}/${folderSlug}`;

    console.log(`🔍 [FTP DEBUG] Intentando crear carpeta en: ${targetPath}`);

    await client.ensureDir(targetPath);

    console.log(`[FTP Success] Carpeta creada correctamente.`);

    return {
      success: true,
      path: targetPath,
    };
  } catch (error) {
    console.error("[FTP Error] Error al crear la carpeta:", error.message);
    throw error;
  } finally {
    client.close();
  }
}

export async function borrarCarpetaResultadoTorneo(slug) {
  const client = new ftp.Client();
  try {
    await client.access(obtenerConfig());
    const baseDir = (process.env.FTP_BASE_DIR || "domains/mediumaquamarine-pelican-819722.hostingersite.com/public_html/resultados").replace(/^\/+/, "");
    await client.removeDir(`${baseDir}/${slug}`);
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
    const baseDir = (process.env.FTP_BASE_DIR || "domains/mediumaquamarine-pelican-819722.hostingersite.com/public_html/resultados").replace(/^\/+/, "");
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
    const baseDir = (process.env.FTP_BASE_DIR || "domains/mediumaquamarine-pelican-819722.hostingersite.com/public_html/resultados").replace(/^\/+/, "");
    
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