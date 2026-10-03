import Torneo from "../../models/Torneo.js";
import { actualizarEventoCalendario } from "../../config/google.js";
import { subirBufferACloudinary } from "../../config/cloudinary.js"; // <-- NUEVO

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

async function generarSlugUnico(nombre, idActual) {
  const slugBase = generarSlug(nombre);
  let slugFinal = slugBase;
  let contador = 1;

  while (
    await Torneo.findOne({
      slug: slugFinal,
      _id: { $ne: idActual },
    })
  ) {
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

const actualizarTorneo = async (req, res) => {
  try {
    const data = {};

    if (req.body.nombre) {
      data.nombre = req.body.nombre;
      data.slug = await generarSlugUnico(req.body.nombre, req.params.id);
    }

    if (req.body.fecha) data.fecha = req.body.fecha;
    if (req.body.descripcion !== undefined) data.descripcion = req.body.descripcion;
    if (req.body.direccion !== undefined) data.direccion = req.body.direccion;
    if (req.body.reglas !== undefined) data.reglas = req.body.reglas;

    if (req.body.categorias !== undefined) {
      data.categorias = parsearCategorias(req.body.categorias);
    }

    if (req.body.transmisiones !== undefined) {
      data.transmisiones = parsearTransmisiones(req.body.transmisiones);
    }

    // NUEVO: subir foto a Cloudinary
    if (req.file) {
      const resultadoFoto = await subirBufferACloudinary(
        req.file.buffer,
        `torneo_${Date.now()}`,
        "fmj/torneos"
      );
      data.fotos = [resultadoFoto.secure_url];
    }

    const torneo = await Torneo.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!torneo) {
      return res.status(404).json({
        mensaje: "Torneo no encontrado",
      });
    }

    try {
      await actualizarEventoCalendario(torneo);
    } catch (errorGoogle) {
      console.error(
        "Torneo actualizado, pero falló Google Calendar:",
        errorGoogle.message
      );
    }

    res.json({
      mensaje: "Torneo actualizado",
      torneo,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar torneo",
      error: error.message,
    });
  }
};

export default actualizarTorneo;