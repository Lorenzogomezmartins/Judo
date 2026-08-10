// src/controllers/inscripciones/rechazarInscripcion.controller.js
import InscripcionUsuario from '../../models/InscripcionUsuario.js';

export async function rechazarInscripcion(req, res) {
  try {
    const { id } = req.params;

    const inscripcion = await InscripcionUsuario.findByIdAndDelete(id);

    if (!inscripcion) {
      return res.status(404).json({
        mensaje: 'Inscripción no encontrada',
      });
    }

    return res.status(200).json({
      mensaje: 'Inscripción rechazada y eliminada correctamente',
      inscripcion,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error rechazando inscripción',
      error: error.message,
    });
  }
}