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

const baseDir = (process.env.FTP_BASE_DIR || "public_html/resultados").replace(/^\/+/, "");

// Función auxiliar para conectar directamente (requerida por algunos controladores)
export async function conectarFTP() {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;
  await client.access(obtenerConfig());
  return client;
}

// Crear la carpeta del torneo usando ruta absoluta segura para jaulas de Hostinger
export async function crearCarpetaResultadoTorneo(folderSlug) {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;

  try {
    await client.access(obtenerConfig());
    
    console.log(`🔍 [FTP DEBUG] Directorio inicial al conectar: ${await client.pwd()}`);

    // Usamos la ruta absoluta desde la raíz de la jaula (/public_html)
    // ensureDir creará /public_html/resultados y /public_html/resultados/folderSlug de un solo golpe
    const rutaCompleta = `/public_html/resultados/${folderSlug}`;
    console.log(`🔍 [FTP DEBUG] Asegurando ruta completa: ${rutaCompleta}`);
    
    await client.ensureDir(rutaCompleta);

    const rutaFinal = await client.pwd();
    console.log(`[FTP Success] Carpeta creada y posicionada en: ${rutaFinal}`);

    return {
      success: true,
      path: `public_html/resultados/${folderSlug}`,
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
    
    const rutaCarpeta = `/public_html/resultados/${folderSlug}`;
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
    
    const rutaCarpeta = `/public_html/resultados/${folderSlug}`;
    await client.cd(rutaCarpeta);
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
    await client.cd(`${baseDir}/${folderSlug}`);
    
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