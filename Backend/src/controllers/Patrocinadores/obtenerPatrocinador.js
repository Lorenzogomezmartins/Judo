// controllers/patrocinadores/obtenerPatrocinador.js
import Patrocinador from '../../models/patrocinador.js';

const obtenerPatrocinador = async (req, res) => {
  try {
    const patrocinador = await Patrocinador.findById(req.params.id);

    if (!patrocinador) {
      return res.status(404).json({ mensaje: 'Patrocinador no encontrado' });
    }

    res.json(patrocinador);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default obtenerPatrocinador;
