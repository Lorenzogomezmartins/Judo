import Usuario from "../../models/Usuario.js";

const modificarUsuario = async (req, res) => {
  try {
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({
      mensaje: "Usuario actualizado",
      usuario: usuarioActualizado
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default modificarUsuario;
