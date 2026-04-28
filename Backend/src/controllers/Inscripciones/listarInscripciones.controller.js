// src/controllers/inscripciones/listarInscripciones.controller.js
import InscripcionUsuario from '../../models/InscripcionUsuario.js';

export async function listarInscripciones(req, res) {
  try {
    const { estado } = req.query;

    const filtro = estado ? { estado } : {};

    const inscripciones = await InscripcionUsuario.find(filtro).sort({
      createdAt: -1,
    });

    return res.status(200).json(inscripciones);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error listando inscripciones',
      error: error.message,
    });
  }
}