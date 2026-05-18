import Torneo from '../../models/Torneo.js';

function generarSlug(nombre = '') {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\d{4}/g, '')
    .replace(/\bfmj\b/g, '')
    .replace(/\btorneo\b/g, '')
    .replace(/\bcopa\b/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const crearTorneo = async (req, res) => {
  try {
    const categorias = req.body.categorias
      ? JSON.parse(req.body.categorias)
      : [];

    const slug = generarSlug(req.body.nombre);

    const torneo = new Torneo({
      nombre: req.body.nombre,
      slug,
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