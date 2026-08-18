import Inscripcion from "../../models/inscripcion.js";

const eliminarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;

    const inscripcion = await Inscripcion.findByIdAndDelete(id);

    if (!inscripcion) {
      return res.status(404).json({
        mensaje: "Inscripción no encontrada.",
      });
    }

    res.json({
      mensaje: "Inscripción eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando inscripción:", error);

    res.status(500).json({
      mensaje: "Error al eliminar la inscripción.",
    });
  }
};

export default eliminarInscripcion;