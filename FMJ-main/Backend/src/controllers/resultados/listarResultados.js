import Resultado from "../../models/Resultado.js";

const listarResultados = async (req, res) => {
  try {
    const resultados = await Resultado.find().sort({
      anio: -1,
      createdAt: -1,
    });

    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al listar resultados",
      error: error.message,
    });
  }
};

export default listarResultados;