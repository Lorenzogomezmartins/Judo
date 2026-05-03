import Torneo from '../../models/Torneo.js';

const crearTorneo = async (req, res) => {
  try {
    const categorias = req.body.categorias
      ? JSON.parse(req.body.categorias)
      : [];

    const torneo = new Torneo({
      nombre: req.body.nombre,
      fecha: req.body.fecha,
      direccion: req.body.direccion,
      reglas: req.body.reglas,
      categorias,
      fotos: req.file
        ? [`/assets/Torneos/${req.file.filename}`]
        : []
    });

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