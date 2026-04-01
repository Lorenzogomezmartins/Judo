// src/controllers/usuarios/sumarPuntos.js
import Usuario from '../../models/Usuario.js';

const sumarPuntos = async (req, res) => {
  try {
    const { puntos, torneoId, puesto } = req.body;

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    usuario.historialTorneos.push({
      torneo: torneoId || null,
      puesto: puesto || null,
      puntos: Math.abs(puntos)
    });

    await usuario.save();

    res.json({ mensaje: "Puntos sumados correctamente", usuario });

  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default sumarPuntos;