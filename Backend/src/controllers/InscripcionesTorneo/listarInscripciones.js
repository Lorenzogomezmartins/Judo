import Inscripcion from "../../models/inscripcion.js";

const listarInscripciones = async (req, res) => {
  try {
    const {
      torneo,
      nombre,
      categoria,
      peso,
      institucion,
    } = req.query;

    const filtro = {};

    // ==========================================
    // FILTRO POR TORNEO
    // ==========================================

    if (torneo) {
      filtro.torneo = torneo;
    }

    // ==========================================
    // FILTRO POR NOMBRE / APELLIDO
    // ==========================================

    if (nombre) {
      const texto = nombre.trim();

      filtro.$or = [
        {
          nombre: {
            $regex: texto,
            $options: "i",
          },
        },
        {
          apellido: {
            $regex: texto,
            $options: "i",
          },
        },
      ];
    }

    // ==========================================
    // FILTRO POR CATEGORÍA
    // ==========================================

    if (categoria) {
      filtro.categoria = {
        $regex: categoria.trim(),
        $options: "i",
      };
    }

    // ==========================================
    // FILTRO POR PESO
    // ==========================================

    if (peso !== undefined && peso !== "") {
      const pesoNumero = Number(peso);

      if (Number.isNaN(pesoNumero)) {
        return res.status(400).json({
          mensaje: "El peso indicado no es válido.",
        });
      }

      filtro.peso = pesoNumero;
    }

    // ==========================================
    // FILTRO POR INSTITUCIÓN
    // ==========================================

    if (institucion) {
      filtro.institucion = {
        $regex: institucion.trim(),
        $options: "i",
      };
    }

    // ==========================================
    // BUSCAR
    // ==========================================

    const inscripciones = await Inscripcion.find(filtro)
      .populate("torneo", "nombre fecha slug")
      .sort({
        apellido: 1,
        nombre: 1,
      });

    res.json(inscripciones);
  } catch (error) {
    console.error("Error listando inscripciones:", error);

    res.status(500).json({
      mensaje: "Error al obtener las inscripciones.",
    });
  }
};

export default listarInscripciones;