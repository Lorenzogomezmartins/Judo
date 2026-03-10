// src/controllers/profesores/crearProfesor.js
import Profesor from '../../models/profesor.js';

const crearProfesor = async (req, res) => {
  try {
    const { nombre, apellido, descripcion } = req.body;

    const profesor = new Profesor({
      nombre,
      apellido,
      descripcion,
      foto: req.file ? req.file.filename : null,
    });

    await profesor.save();
    res.status(201).json(profesor);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default crearProfesor;
