import Resultado from "../../models/Resultado.js";

const listarResultadosPorTorneo = async (req, res) => {
  try {
    const { torneoSlug } = req.params;
    const { anio } = req.query;

    const filtro = { torneoSlug };

    if (anio) {
      filtro.anio = Number(anio);
    }

    const resultados = await Resultado.find(filtro)
      .select("-contenidoOriginal")
      .sort({ anio: -1, archivoNombre: 1 });

    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al listar resultados del torneo",
      error: error.message,
    });
  }
};

export default listarResultadosPorTorneo;