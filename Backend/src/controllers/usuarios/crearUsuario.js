import Usuario from "../../models/Usuario.js";

const crearUsuario = async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario: nuevoUsuario
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default crearUsuario;
