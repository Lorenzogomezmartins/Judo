import Torneo from "../../models/Torneo.js";
import Resultado from "../../models/Resultado.js";

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

export async function importarResultadosFTP() {
  const carpetas = await listarCarpetasResultadosFTP();

  let procesados = 0;
  let encontrados = 0;
  let omitidos = 0;
  let errores = [];

  const torneos = await Torneo.find({
    slug: { $exists: true, $ne: "" },
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
          contenido,
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