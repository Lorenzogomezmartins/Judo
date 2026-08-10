import Galeria from "../../models/galeria.js";

const listarFotosGaleria = async (req, res) => {
  try {
    const { titulo, desde, hasta } = req.query;

    const filtros = {
      activo: true,
    };

    if (titulo) {
      filtros.titulo = {
        $regex: titulo,
        $options: "i",
      };
    }

    if (desde || hasta) {
      filtros.fecha = {};

      if (desde) {
        filtros.fecha.$gte = new Date(desde);
      }

      if (hasta) {
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999);
        filtros.fecha.$lte = fechaHasta;
      }
    }

    const fotos = await Galeria.find(filtros).sort({
      fecha: -1,
      createdAt: -1,
    });

    res.json(fotos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener la galería",
      error: error.message,
    });
  }
};

export default listarFotosGaleria;