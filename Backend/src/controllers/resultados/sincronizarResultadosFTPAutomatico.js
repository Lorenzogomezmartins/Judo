import Torneo from "../../models/Torneo.js";
import Resultado from "../../models/Resultado.js";
import ftp from "basic-ftp";
import { Writable } from "stream";

function obtenerConfig() {
  return {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false,
  };
}

const baseDir = (process.env.FTP_BASE_DIR || "public_html/resultados").replace(/^\/+/, "");

// Listar carpetas del FTP
async function listarCarpetasResultadosFTP() {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;
  try {
    await client.access(obtenerConfig());
    await client.cd(`/${baseDir}`);
    const list = await client.list();
    return list.filter(item => item.isDirectory).map(item => item.name);
  } catch (error) {
    console.error("[FTP Error] Error al listar carpetas:", error.message);
    return [];
  } finally {
    client.close();
  }
}

// Verificar si existe archivo HTML en la carpeta
async function existeResultadoFTP(folderSlug) {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;
  try {
    await client.access(obtenerConfig());
    await client.cd(`/${baseDir}/${folderSlug}`);
    const list = await client.list();
    return list.some(item => !item.isDirectory && (item.name.endsWith('.html') || item.name.endsWith('.htm')));
  } catch (error) {
    return false;
  } finally {
    client.close();
  }
}

// Descargar el contenido del archivo HTML
async function descargarResultadoFTP(folderSlug) {
  const client = new ftp.Client();
  client.ftp.timeout = 15000;
  try {
    await client.access(obtenerConfig());
    await client.cd(`/${baseDir}/${folderSlug}`);
    
    const list = await client.list();
    const archivoHtml = list.find(item => !item.isDirectory && (item.name.endsWith('.html') || item.name.endsWith('.htm')));
    
    if (!archivoHtml) return "";

    const chunks = [];
    await client.downloadTo(
      new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      }),
      archivoHtml.name
    );
    
    return Buffer.concat(chunks).toString("utf-8");
  } catch (error) {
    console.error("[FTP Error] Error al descargar archivo:", error.message);
    return "";
  } finally {
    client.close();
  }
}

function obtenerAnio(fecha) {
  return new Date(fecha).getFullYear();
}

function normalizarSlug(slug = "") {
  return slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function importarResultadosFTP() {
  const carpetas = await listarCarpetasResultadosFTP();

  let procesados = 0;
  let encontrados = 0;
  let omitidos = 0;
  let errores = [];

  const torneos = await Torneo.find({
    slug: { $exists: true,$ne: "" },
  });

  for (const torneo of torneos) {
    try {
      const slug = normalizarSlug(torneo.slug);
      const carpeta = carpetas.find(
        (nombre) => normalizarSlug(nombre) === slug
      );

      if (!carpeta) {
        omitidos++;
        continue;
      }

      const existe = await existeResultadoFTP(carpeta);

      if (!existe) {
        omitidos++;
        continue;
      }

      const contenido = await descargarResultadoFTP(carpeta);

      await Resultado.findOneAndUpdate(
        { torneoSlug: torneo.slug },
        {
          torneoSlug: torneo.slug,
          torneoNombre: torneo.nombre,
          anio: obtenerAnio(torneo.fecha),
          carpetaFTP: carpeta,
          contenidoOriginal: contenido,
          disponible: true,
          ultimaSincronizacion: new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      encontrados++;
      procesados++;
    } catch (error) {
      errores.push({
        torneo: torneo.nombre,
        slug: torneo.slug,
        error: error.message,
      });
    }
  }

  return {
    ok: true,
    procesados,
    encontrados,
    omitidos,
    errores,
  };
}

const sincronizarResultadosFTPAutomatico = async () => {
  try {
    const resultado = await importarResultadosFTP();

    console.log(
      `[RESULTADOS FTP] Sincronización finalizada: ${JSON.stringify(resultado)}`
    );

    return resultado;
  } catch (error) {
    console.error(
      "[RESULTADOS FTP] Error en sincronización automática:",
      error.message
    );

    return {
      ok: false,
      error: error.message,
    };
  }
};

export default sincronizarResultadosFTPAutomatico;