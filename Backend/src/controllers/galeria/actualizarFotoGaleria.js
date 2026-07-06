import Galeria from "../../models/galeria.js";
import cloudinary, { subirBufferACloudinary } from "../../config/cloudinary.js";

const actualizarFotoGaleria = async (req, res) => {
  try {
    const foto = await Galeria.findById(req.params.id);

    if (!foto || !foto.activo) {
      return res.status(404).json({
        mensaje: "Foto no encontrada",
      });
    }

    const { titulo, fecha } = req.body;

    foto.titulo = titulo ?? foto.titulo;

    if (fecha) {
      foto.fecha = fecha;
    }

    if (req.file) {
      if (foto.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(foto.cloudinaryPublicId);
      }

      const publicId = `foto-${Date.now()}`;

      const resultadoCloudinary = await subirBufferACloudinary(
        req.file.buffer,
        publicId,
        "fmj/galeria"
      );

      foto.imagen = resultadoCloudinary.secure_url;
      foto.cloudinaryPublicId = resultadoCloudinary.public_id;
    }

    await foto.save();

    res.json({
      mensaje: "Foto actualizada correctamente",
      foto,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar la foto",
      error: error.message,
    });
  }
};

export default actualizarFotoGaleria;