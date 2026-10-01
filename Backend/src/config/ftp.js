import ftp from "basic-ftp";
import { Writable } from "stream";

// Función para obtener la configuración usando las variables de entorno
function obtenerConfig() {
  return {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false,
  };
}

// Carpeta base de resultados DENTRO de la raíz de la cuenta FTP (viene del .env).
// Ejemplos: "public_html/resultados"  o  "resultados"
// Se quitan "/" al inicio y al final para poder armar rutas de forma segura.
const baseDir = (process.env.FTP_BASE_DIR || "public_html/resultados")
  .trim()
  .replace(/^\/+/, "")
  .replace(/\/+$/, "");

// Ruta absoluta dentro del FTP para una carpeta de torneo
function rutaTorneo(folderSlug) {
  return `/${baseDir}/${folderSlug}`;
}

// Función auxiliar para conectar directamente (requerida por algunos controladores)
export async function conectarFTP() {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;
  await client.access(obtenerConfig());
  return client;
}

// Crear la carpeta del torneo
export async function crearCarpetaResultadoTorneo(folderSlug) {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;

  try {
    await client.access(obtenerConfig());

    console.log(`🔍 [FTP DEBUG] Directorio inicial al conectar: ${await client.pwd()}`);

    const rutaCompleta = rutaTorneo(folderSlug);
    console.log(`🔍 [FTP DEBUG] Asegurando ruta completa: ${rutaCompleta}`);

    // ensureDir crea toda la ruta si no existe
    await client.ensureDir(rutaCompleta);

    const rutaFinal = await client.pwd();
    console.log(`[FTP Success] Carpeta creada y posicionada en: ${rutaFinal}`);

    return {
      success: true,
      path: `${baseDir}/${folderSlug}`,
    };
  } catch (error) {
    console.error("[FTP Error] Error al crear la carpeta:", error.message);
    throw error;
  } finally {
    client.close();
  }
}

// Borrar carpeta de resultado de torneo
export async function borrarCarpetaResultadoTorneo(folderSlug) {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;

  try {
    await client.access(obtenerConfig());

    const rutaCarpeta = rutaTorneo(folderSlug);
    console.log(`🔍 [FTP DEBUG] Borrando carpeta recursivamente: ${rutaCarpeta}`);

    await client.removeDir(rutaCarpeta);
    console.log(`[FTP Success] Carpeta ${folderSlug} borrada correctamente.`);

    return { success: true };
  } catch (error) {
    console.error("[FTP Error] Error al borrar la carpeta:", error.message);
    throw error;
  } finally {
    client.close();
  }
}

// Listar archivos del torneo
export async function listarArchivosFTP(folderSlug) {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;

  try {
    await client.access(obtenerConfig());

    await client.cd(rutaTorneo(folderSlug));
    const list = await client.list();

    return list;
  } catch (error) {
    console.error("[FTP Error] Error al listar archivos:", error.message);
    throw error;
  } finally {
    client.close();
  }
}

// Leer un archivo específico del torneo
export async function leerArchivoFTP(folderSlug, nombreArchivo) {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;

  try {
    await client.access(obtenerConfig());
    await client.cd(rutaTorneo(folderSlug));

    const chunks = [];
    await client.downloadTo(
      new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      }),
      nombreArchivo
    );

    return Buffer.concat(chunks).toString("utf-8");
  } catch (error) {
    console.error("[FTP Error] Error al leer el archivo:", error.message);
    throw error;
  } finally {
    client.close();
  }
}