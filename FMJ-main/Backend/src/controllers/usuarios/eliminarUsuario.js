// src/controllers/usuarios/eliminarUsuario.js
import Usuario from '../../models/usuario.js';

const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default eliminarUsuario;