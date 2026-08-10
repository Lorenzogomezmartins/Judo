import Torneo from "../../models/Torneo.js";

const obtenerTorneos = async (req, res) => {
  try {
    const torneos = await Torneo.find().sort({ fecha: -1 });

    res.status(200).json(torneos);
  } catch (error) {
    console.error("Error al obtener torneos:", error);
    res.status(500).json({
      mensaje: "Error al obtener torneos",
      error: error.message
    });
  }
};

export default obtenerTorneos;