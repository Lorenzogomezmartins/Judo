import Resultado from "../../models/Resultado.js";

const listarTorneosConResultados = async (req, res) => {
  try {
    const torneos = await Resultado.aggregate([
      {
        $group: {
          _id: "$torneoSlug",
          torneoNombre: { $first: "$torneoNombre" },
          torneoSlug: { $first: "$torneoSlug" },
          anios: { $addToSet: "$anio" },
          cantidadArchivos: { $sum: 1 },
          ultimaActualizacion: { $max: "$updatedAt" },
        },
      },
      {
        $sort: {
          torneoNombre: 1,
        },
      },
    ]);

    res.status(200).json(torneos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al listar torneos con resultados",
      error: error.message,
    });
  }
};

export default listarTorneosConResultados;