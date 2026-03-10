// controllers/patrocinadores/crearPatrocinador.js
import Patrocinador from '../../models/patrocinador.js';

const crearPatrocinador = async (req, res) => {
  try {
    const { nombre, contacto, sitioWeb } = req.body;

    const patrocinador = new Patrocinador({
      nombre,
      contacto,
      sitioWeb,
      logo: req.file ? req.file.filename : null,
    });

    await patrocinador.save();
    res.status(201).json(patrocinador);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default crearPatrocinador;
