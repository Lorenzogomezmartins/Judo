import Inscripcion from "../../models/inscripcion.js";

const obtenerInscripcion = async (req, res) => {
  try {
    const { id } = req.params;

    const inscripcion = await Inscripcion.findById(id).populate(
      "torneo",
      "nombre fecha slug categorias"
    );

    if (!inscripcion) {
      return res.status(404).json({
        mensaje: "Inscripción no encontrada.",
      });
    }

    res.json(inscripcion);
  } catch (error) {
    console.error("Error obteniendo inscripción:", error);

    res.status(500).json({
      mensaje: "Error al obtener la inscripción.",
    });
  }
};

export default obtenerInscripcion;