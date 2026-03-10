// src/controllers/profesores/eliminarProfesor.js
import Profesor from '../../models/profesor.js';

const eliminarProfesor = async (req, res) => {
  try {
    const profesor = await Profesor.findByIdAndDelete(req.params.id);

    if (!profesor) {
      return res.status(404).json({ mensaje: 'Profesor no encontrado' });
    }

    res.json({ mensaje: 'Profesor eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default eliminarProfesor;
