import Torneo from '../../models/Torneo.js';

const obtenerTorneoPorId = async (req, res) => {
  try {
    const torneo = await Torneo.findById(req.params.id);

    if (!torneo) {
      return res.status(404).json({ mensaje: 'Torneo no encontrado' });
    }

    res.json(torneo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default obtenerTorneoPorId;