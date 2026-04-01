import Torneo from '../../models/Torneo.js';

const crearTorneo = async (req, res) => {
  try {
    const torneo = new Torneo(req.body);
    const guardado = await torneo.save();

    res.status(201).json({
      mensaje: 'Torneo creado correctamente',
      torneo: guardado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default crearTorneo;