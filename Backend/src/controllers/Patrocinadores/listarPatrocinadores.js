// controllers/patrocinadores/listarPatrocinadores.js
import Patrocinador from '../../models/patrocinador.js';

const listarPatrocinadores = async (req, res) => {
  try {
    const patrocinadores = await Patrocinador.find();
    res.json(patrocinadores);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default listarPatrocinadores;
