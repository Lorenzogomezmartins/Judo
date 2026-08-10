import Galeria from "../../models/galeria.js";

const obtenerFotoGaleria = async (req, res) => {
  try {
    const foto = await Galeria.findById(req.params.id);

    if (!foto || !foto.activo) {
      return res.status(404).json({
        mensaje: "Foto no encontrada",
      });
    }

    res.json(foto);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener la foto",
      error: error.message,
    });
  }
};

export default obtenerFotoGaleria;