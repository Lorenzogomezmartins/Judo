// src/controllers/profesores/listarProfesores.js
import Profesor from '../../models/profesor.js';

const listarProfesores = async (req, res) => {
  try {
    const profesores = await Profesor.find();
    res.json(profesores);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default listarProfesores;
