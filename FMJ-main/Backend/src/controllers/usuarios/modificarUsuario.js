// src/controllers/usuarios/modificarUsuario.js
import Usuario from '../../models/usuario.js';

const modificarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, dni, email, telefono, sexo, peso, clasificacion } = req.body;
    
    // Construir objeto con los datos a actualizar
    const datosActualizar = {
      nombre,
      apellido,
      dni,
      email,
      telefono,
      sexo,
      peso,
      clasificacion
    };
    
    // Si se subió una nueva foto, actualizarla
    if (req.file) {
      datosActualizar.ft = req.file.filename;
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      datosActualizar,
      { new: true, runValidators: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({
      mensaje: "Usuario actualizado correctamente",
      usuario: usuarioActualizado
    });

  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default modificarUsuario;