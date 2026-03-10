// controllers/patrocinadores/eliminarPatrocinador.js
import Patrocinador from '../../models/patrocinador.js';

const eliminarPatrocinador = async (req, res) => {
  try {
    const patrocinador = await Patrocinador.findByIdAndDelete(req.params.id);

    if (!patrocinador) {
      return res.status(404).json({ mensaje: 'Patrocinador no encontrado' });
    }

    res.json({ mensaje: 'Patrocinador eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default eliminarPatrocinador;
