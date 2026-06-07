import Torneo from "../../models/Torneo.js";
import { actualizarEventoCalendario } from "../../config/google.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";

function generarSlug(nombre = "") {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bfmj\b/g, "")
    .replace(/\btorneo\b/g, "")
    .replace(/\bcopa\b/g, "")
    .trim()
    .replace(/\s+/g, "-");
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

function subirImagenCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "fmj/torneos",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

const actualizarTorneo = async (req, res) => {
  try {
    const data = {};

    if (req.body.nombre) {
  data.nombre = req.body.nombre;
}

    if (req.body.fecha) data.fecha = req.body.fecha;
    if (req.body.direccion !== undefined) data.direccion = req.body.direccion;
    if (req.body.reglas !== undefined) data.reglas = req.body.reglas;
    if (req.body.youtubeUrl !== undefined) {
      data.youtubeUrl = req.body.youtubeUrl.trim();
    }

    data.tipo = "torneo";

    if (req.body.categorias !== undefined) {
      data.categorias = parsearCategorias(req.body.categorias);
    }

    if (req.file) {
      const resultado = await subirImagenCloudinary(req.file);
      data.fotos = [resultado.secure_url];
    }

    const torneo = await Torneo.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!torneo) {
      return res.status(404).json({ mensaje: "Torneo no encontrado" });
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
    res.status(500).json({ error: error.message });
  }
};

export default actualizarTorneo;