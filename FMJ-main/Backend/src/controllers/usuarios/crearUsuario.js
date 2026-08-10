// src/controllers/usuarios/crearUsuario.js
import Usuario from '../../models/usuario.js';

const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, dni, email, telefono, sexo, peso, clasificacion } = req.body;

    const usuario = new Usuario({
      nombre,
      apellido,
      dni,
      email,
      telefono,
      sexo,
      peso,
      clasificacion,
      ft: req.file ? req.file.filename : null,
    });

    await usuario.save();
    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default crearUsuario;