import Torneo from '../../models/Torneo.js';

const actualizarTorneo = async (req, res) => {
  try {
    const torneo = await Torneo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!torneo) {
      return res.status(404).json({ mensaje: 'Torneo no encontrado' });
    }

    res.json({
      mensaje: 'Torneo actualizado',
      torneo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default actualizarTorneo;