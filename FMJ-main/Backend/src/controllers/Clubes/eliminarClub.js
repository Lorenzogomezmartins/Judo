// src/controllers/clubes/eliminarClub.js
import Club from '../../models/club.js';

const eliminarClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);

    if (!club) {
      return res.status(404).json({ mensaje: 'Club no encontrado' });
    }

    res.json({ mensaje: 'Club eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default eliminarClub;