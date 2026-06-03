import Profesor from "../../models/profesor.js";

const actualizarProfesor = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.capacitaciones) {
      data.capacitaciones = JSON.parse(data.capacitaciones);
    }

    if (req.file) {
      data.foto = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const profesor = await Profesor.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profesor) {
      return res.status(404).json({
        mensaje: "Profesor no encontrado",
      });
    }

    res.json(profesor);
  } catch (error) {
    res.status(500).json({
      mensaje: error.message,
    });
  }
};

export default actualizarProfesor;