import Profesor from "../../models/profesor.js";

const obtenerProfesor = async (req, res) => {
  try {
    const { id } = req.params;

    const profesor = await Profesor.findById(id);

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

export default obtenerProfesor;