// src/controllers/usuarios/listarUsuarios.js
import Usuario from '../../models/usuario.js';

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);

  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default listarUsuarios;