import Club from '../../models/club.js';

const actualizarClub = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.logo = req.file.filename;
    }

    const club = await Club.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!club) {
      return res.status(404).json({ mensaje: 'Club no encontrado' });
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default actualizarClub;