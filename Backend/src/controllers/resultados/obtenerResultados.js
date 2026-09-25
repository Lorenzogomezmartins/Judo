import Resultado from "../../models/Resultado.js";

const obtenerResultados = async (req, res) => {
  try {
    const { slug } = req.params;

    const resultado = await Resultado.findOne({
      torneoSlug: slug,
      disponible: true,
    });

    if (!resultado) {
      return res.status(404).json({
        mensaje: "Resultados no disponibles para este torneo",
        disponibles: false,
      });
    }

    res.json({
      disponibles: true,
      resultado,
    });
  } catch (error) {
    console.error("Error obteniendo resultados:", error);

    res.status(500).json({
      mensaje: "Error obteniendo resultados",
      error: error.message,
    });
  }
};

export default obtenerResultados;