import RankingUsuario from "../../models/RankingUsuario.js";

export async function listarRanking(req, res) {
  try {
    const ranking = await RankingUsuario.find().sort({
      puntajeTotal: -1,
      apellido: 1,
    });

    return res.status(200).json(ranking);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error listando ranking",
      error: error.message,
    });
  }
} 