import Patrocinador from '../../models/patrocinador.js';

const actualizarPatrocinador = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.logo = `/assets/Patrocinadores/${req.file.filename}`;
    }

    const patrocinador = await Patrocinador.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!patrocinador) {
      return res.status(404).json({
        mensaje: 'Patrocinador no encontrado'
      });
    }

    res.json(patrocinador);

  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default actualizarPatrocinador;