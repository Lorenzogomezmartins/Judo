import Torneo from "../../models/Torneo.js";
import { crearEventoCalendario } from "../../config/google.js";
import { crearCarpetaResultadoTorneo } from "../../config/ftp.js";

function generarSlug(nombre = "") {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bfmj\b/g, "")
    .replace(/\btorneo\b/g, "")
    .replace(/\bcopa\b/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function generarSlugUnico(nombre) {
  const slugBase = generarSlug(nombre);
  let slugFinal = slugBase;
  let contador = 1;

  while (await Torneo.findOne({ slug: slugFinal })) {
    contador++;
    slugFinal = `${slugBase}-${contador}`;
  }

  return slugFinal;
}

function parsearCategorias(categorias) {
  if (!categorias) return [];

  try {
    const parsed = JSON.parse(categorias);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return categorias
      .split(",")
      .map((cat) => cat.trim())
      .filter(Boolean);
  }
}

function parsearTransmisiones(transmisiones) {
  if (!transmisiones) return [];

  try {
    const parsed = JSON.parse(transmisiones);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((transmision) => ({
        titulo: transmision.titulo || "",
        url: transmision.url || "",
      }))
      .filter((transmision) => transmision.url);
  } catch {
    return [];
  }
}

const crearTorneo = async (req, res) => {
  try {
    const categorias = parsearCategorias(req.body.categorias);
    const transmisiones = parsearTransmisiones(req.body.transmisiones);
    const slug = await generarSlugUnico(req.body.nombre);

   const torneo = new Torneo({
      nombre: req.body.nombre,
      tipo: req.body.tipo || "torneo",
      slug,
      fecha: req.body.fecha,
      descripcion: req.body.descripcion || "",
      direccion: req.body.direccion || "",
      reglas: req.body.reglas || "",
      categorias,
      transmisiones,
      fotos: req.file ? [req.file.path] : [],
      tieneResultados: true, // <--- Agrégalo aquí para que el frontend active el botón automáticamente
    });

    const guardado = await torneo.save();

    try {
      await crearCarpetaResultadoTorneo(guardado.slug);
    } catch (errorFTP) {
      console.error(
        "Torneo creado, pero falló la creación de carpeta FTP:",
        errorFTP.message
      );
    }

    try {
      const eventoGoogle = await crearEventoCalendario(guardado);

      guardado.googleCalendarEventId = eventoGoogle.id;
      await guardado.save();
    } catch (errorGoogle) {
      console.error(
        "Torneo creado, pero falló Google Calendar:",
        errorGoogle.message
      );
    }

    res.status(201).json({
      mensaje: "Torneo creado correctamente",
      torneo: guardado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear torneo",
      error: error.message,
    });
  }
};

export default crearTorneo;