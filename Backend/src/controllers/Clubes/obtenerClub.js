// src/controllers/clubes/obtenerClub.js
import Club from '../../models/club.js';

const obtenerClub = async (req, res) => {
  try {
    const { nombre } = req.params;

    // Búsqueda exacta case-insensitive
    const club = await Club.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });

    if (!club) {
      return res.status(404).json({ mensaje: 'Club no encontrado' });
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default obtenerClub;
