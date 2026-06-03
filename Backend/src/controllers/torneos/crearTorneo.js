import Torneo from '../../models/Torneo.js';
import { crearEventoCalendario } from '../../config/google.js';

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
  tipo: "torneo",
  slug,
  fecha: req.body.fecha,
  direccion: req.body.direccion,
  reglas: req.body.reglas,
  categorias,
  fotos: req.file ? [req.file.path] : []
});

    const guardado = await torneo.save();

    try {
      const eventoGoogle = await crearEventoCalendario(guardado);

      guardado.googleCalendarEventId = eventoGoogle.id;
      await guardado.save();
    } catch (errorGoogle) {
      console.error(
        'Torneo creado, pero falló Google Calendar:',
        errorGoogle.message
      );
    }

    res.status(201).json({
      mensaje: 'Torneo creado correctamente',
      torneo: guardado
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default crearTorneo;