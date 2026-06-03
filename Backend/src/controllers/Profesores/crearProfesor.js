import Profesor from "../../models/profesor.js";

const crearProfesor = async (req, res) => {
  try {
    const { nombre, apellido, club, descripcion } = req.body;

    if (!nombre || !apellido) {
      return res.status(400).json({
        mensaje: "Nombre y apellido son obligatorios",
      });
    }

    let capacitaciones = [];

    if (req.body.capacitaciones) {
      capacitaciones = JSON.parse(req.body.capacitaciones);
    }

    let fotoBase64 = null;

    if (req.file) {
      fotoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const profesor = new Profesor({
      nombre,
      apellido,
      club,
      descripcion,
      foto: fotoBase64,
      capacitaciones,
    });

    await profesor.save();

    res.status(201).json(profesor);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

export default crearProfesor;