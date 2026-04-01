import Torneo from '../../models/Torneo.js';

const eliminarTorneo = async (req, res) => {
  try {
    const torneo = await Torneo.findByIdAndDelete(req.params.id);

    if (!torneo) {
      return res.status(404).json({ mensaje: 'Torneo no encontrado' });
    }

    res.json({ mensaje: 'Torneo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default eliminarTorneo;