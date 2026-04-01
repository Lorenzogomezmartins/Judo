// src/controllers/usuarios/obtenerPuntos.js
import Usuario from '../../models/Usuario.js';

const obtenerPuntos = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const puntosTotales = usuario.historialTorneos.reduce(
      (acc, torneo) => acc + (torneo.puntos || 0),
      0
    );

    res.json({ puntos: puntosTotales });

  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default obtenerPuntos;