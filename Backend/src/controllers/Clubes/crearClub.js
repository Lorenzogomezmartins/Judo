import Club from '../../models/club.js';

const crearClub = async (req, res) => {
  try {
    const { nombre, telefono, direccion, sitioWeb } = req.body;

    const club = new Club({
      nombre,
      telefono,
      direccion,
      sitioWeb,
      logo: req.file ? req.file.filename : null,
    });

    await club.save();
    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default crearClub;