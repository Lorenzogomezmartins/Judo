import Resultado from "../../models/Resultado.js";

const verResultadoHTML = async (req, res) => {
  try {
    const resultado = await Resultado.findById(req.params.id);

    if (!resultado) {
      return res.status(404).send("Resultado no encontrado");
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(resultado.contenidoOriginal);
  } catch (error) {
    res.status(500).send("Error mostrando resultado");
  }
};

export default verResultadoHTML;