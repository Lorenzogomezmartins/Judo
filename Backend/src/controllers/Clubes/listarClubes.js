// src/controllers/clubes/listarClubes.js
import Club from '../../models/Club.js';

const listarClubes = async (req, res) => {
  try {
    const clubes = await Club.find();
    res.json(clubes);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default listarClubes;
