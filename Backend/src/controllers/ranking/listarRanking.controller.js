import RankingUsuario from "../../models/RankingUsuario.js";

export async function listarRanking(req, res) {
  try {
    const ranking = await RankingUsuario.find()
  .select(
    "dni apellido nombre institucion categoria peso sexo foto fotoPublicId abiertoCiudad2026 copaDoblas2026 torneoMetropolitano2026 puntajeTotal ranking"
  )
  .sort({
    ranking: 1,
  });

return res.status(200).json(ranking);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error listando ranking",
      error: error.message,
    });
  }
} 