import Profesor from "../../models/profesor.js";

const crearProfesor = async (req, res) => {
  try {
    const { nombre, apellido, descripcion } = req.body;

    let fotoBase64 = null;

    if (req.file) {
      fotoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const profesor = new Profesor({
      nombre,
      apellido,
      descripcion,
      foto: fotoBase64,
    });

    await profesor.save();

    res.status(201).json(profesor);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export default crearProfesor;