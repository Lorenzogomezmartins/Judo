import Torneo from '../../models/Torneo.js';

const obtenerTorneos = async (req, res) => {
  try {
    const torneos = await Torneo.find();
    res.json(torneos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default obtenerTorneos;