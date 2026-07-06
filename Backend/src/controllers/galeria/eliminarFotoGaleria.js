import Galeria from "../../models/galeria.js";
import cloudinary from "../../config/cloudinary.js";

const eliminarFotoGaleria = async (req, res) => {
  try {
    const foto = await Galeria.findById(req.params.id);

    if (!foto || !foto.activo) {
      return res.status(404).json({
        mensaje: "Foto no encontrada",
      });
    }

    if (foto.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(foto.cloudinaryPublicId);
    }

    foto.activo = false;
    await foto.save();

    res.json({
      mensaje: "Foto eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar la foto",
      error: error.message,
    });
  }
};

export default eliminarFotoGaleria;