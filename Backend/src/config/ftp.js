import ftp from "basic-ftp";
import { Writable } from "stream";

export async function conectarFTP() {
  const client = new ftp.Client(30000);

  await client.access({
    host: process.env.FTP_HOST,
    port: 21,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false,
  });

  return client;
}

export async function listarArchivosFTP() {
  const client = await conectarFTP();

  try {
    const archivos = [];
    const baseDir = process.env.FTP_BASE_DIR || "/htdocs/resultados";

    async function recorrer(ruta) {
      const items = await client.list(ruta);

      for (const item of items) {
        const rutaCompleta = `${ruta}/${item.name}`.replaceAll("//", "/");

        if (item.isDirectory) {
          await recorrer(rutaCompleta);
        } else {
          archivos.push({
            nombre: item.name,
            ruta: rutaCompleta,
          });
        }
      }
    }

    await recorrer(baseDir);
    return archivos;
  } finally {
    client.close();
  }
}

export async function leerArchivoFTP(rutaArchivo) {
  const client = await conectarFTP();

  try {
    const chunks = [];

    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    await client.downloadTo(writable, rutaArchivo);

    return Buffer.concat(chunks).toString("utf-8");
  } finally {
    client.close();
  }
}

export async function crearCarpetaFTP(rutaCarpeta) {
  const client = await conectarFTP();

  try {
    await client.ensureDir(rutaCarpeta);
    console.log(`✅ Carpeta FTP creada/verificada: ${rutaCarpeta}`);
  } finally {
    client.close();
  }
}

export async function crearCarpetaResultadoTorneo(slug) {
  const baseDir = process.env.FTP_BASE_DIR || "/htdocs/resultados";
  const ruta = `${baseDir}/${slug}`.replaceAll("//", "/");

  await crearCarpetaFTP(ruta);
}

export async function borrarCarpetaFTP(rutaCarpeta) {
  const client = await conectarFTP();

  try {
    await client.removeDir(rutaCarpeta);
    console.log(`🗑️ Carpeta FTP eliminada: ${rutaCarpeta}`);
  } finally {
    client.close();
  }
}

export async function borrarCarpetaResultadoTorneo(slug) {
  const baseDir = process.env.FTP_BASE_DIR || "/htdocs/resultados";
  const ruta = `${baseDir}/${slug}`.replaceAll("//", "/");

  await borrarCarpetaFTP(ruta);
}