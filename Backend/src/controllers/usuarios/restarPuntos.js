import Usuario from "../../models/Usuario.js";

const restarPuntos = async (req, res) => {
  try {
    const { puntos } = req.body;

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    usuario.historialTorneos.push({
      torneo: req.body.torneoId || null,
      puesto: req.body.puesto || null,
      puntos: -Math.abs(puntos)
    });

    await usuario.save();

    res.json({ mensaje: "Puntos restados correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default restarPuntos;
