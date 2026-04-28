// src/controllers/inscripciones/obtenerInscripcion.controller.js
import InscripcionUsuario from '../../models/InscripcionUsuario.js';

export async function obtenerInscripcionPorId(req, res) {
  try {
    const { id } = req.params;

    const inscripcion = await InscripcionUsuario.findById(id);

    if (!inscripcion) {
      return res.status(404).json({
        mensaje: 'Inscripción no encontrada',
      });
    }

    return res.status(200).json(inscripcion);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error obteniendo inscripción',
      error: error.message,
    });
  }
}