import Usuario from "../../models/Usuario.js";

const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
      .populate("historialTorneos.torneo");

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuario);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default obtenerUsuario;
