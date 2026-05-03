import Torneo from '../../models/Torneo.js';

const actualizarTorneo = async (req, res) => {
  try {
    const data = {
      nombre: req.body.nombre,
      fecha: req.body.fecha,
      direccion: req.body.direccion,
      reglas: req.body.reglas,
    };

    if (req.body.categorias) {
      data.categorias = JSON.parse(req.body.categorias);
    }

    if (req.file) {
      data.fotos = [`/assets/Torneos/${req.file.filename}`];
    }

    const torneo = await Torneo.findByIdAndUpdate(
      req.params.id,
      data,
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