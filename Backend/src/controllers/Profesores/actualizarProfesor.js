// src/controllers/profesores/actualizarProfesor.js
import Profesor from '../../models/profesor.js';

const actualizarProfesor = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.foto = req.file.filename;
    }

    const profesor = await Profesor.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!profesor) {
      return res.status(404).json({ mensaje: 'Profesor no encontrado' });
    }

    res.json(profesor);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default actualizarProfesor;
