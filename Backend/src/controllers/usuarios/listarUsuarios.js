import Usuario from "../../models/Usuario.js";

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().populate("historialTorneos.torneo");
    res.json(usuarios);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default listarUsuarios;
