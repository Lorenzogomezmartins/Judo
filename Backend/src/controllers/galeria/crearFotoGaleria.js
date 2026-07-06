import Galeria from "../../models/galeria.js";
import { subirBufferACloudinary } from "../../config/cloudinary.js";

const crearFotoGaleria = async (req, res) => {
  try {
    const { titulo, fecha } = req.body;

    if (!req.file) {
      return res.status(400).json({
        mensaje: "La imagen es obligatoria",
      });
    }

    const publicId = `foto-${Date.now()}`;

    const resultadoCloudinary = await subirBufferACloudinary(
      req.file.buffer,
      publicId,
      "fmj/galeria"
    );

    const foto = new Galeria({
      titulo: titulo || "",
      fecha: fecha || new Date(),
      imagen: resultadoCloudinary.secure_url,
      cloudinaryPublicId: resultadoCloudinary.public_id,
    });

    await foto.save();

    res.status(201).json({
      mensaje: "Foto subida correctamente",
      foto,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al subir la foto",
      error: error.message,
    });
  }
};

export default crearFotoGaleria;