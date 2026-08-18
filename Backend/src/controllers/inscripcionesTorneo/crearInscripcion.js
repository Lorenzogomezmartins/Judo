import Inscripcion from "../../models/inscripcion.js";
import Torneo from "../../models/torneo.js";

const crearInscripcion = async (req, res) => {
  try {
    const {
      torneo,
      institucion,
      instructorDelegado,
      email,
      telefono,
      documentoResponsable,
      competidores,
      aceptaPoliticaDatos,
    } = req.body;

    // ==========================================
    // VALIDAR DATOS DE LA INSTITUCIÓN
    // ==========================================

    if (
      !torneo ||
      !institucion ||
      !instructorDelegado ||
      !email ||
      !telefono
    ) {
      return res.status(400).json({
        mensaje:
          "Institución, instructor/delegado, email y teléfono son obligatorios.",
      });
    }

    // ==========================================
    // VALIDAR COMPETIDORES
    // ==========================================

    if (!Array.isArray(competidores) || competidores.length === 0) {
      return res.status(400).json({
        mensaje: "Debés agregar al menos un competidor.",
      });
    }

    // ==========================================
    // VALIDAR CONSENTIMIENTO
    // ==========================================

    if (aceptaPoliticaDatos !== true) {
      return res.status(400).json({
        mensaje:
          "Debés aceptar la política de tratamiento de datos para realizar la inscripción.",
      });
    }

    // ==========================================
    // BUSCAR TORNEO
    // ==========================================

    const torneoEncontrado = await Torneo.findById(torneo);

    if (!torneoEncontrado) {
      return res.status(404).json({
        mensaje: "El torneo no existe.",
      });
    }

    // ==========================================
    // VALIDAR QUE SEA UN TORNEO
    // ==========================================

    if (torneoEncontrado.tipo !== "torneo") {
      return res.status(400).json({
        mensaje: "Este evento no permite inscripciones de competidores.",
      });
    }

    // ==========================================
    // VALIDAR INSCRIPCIONES HABILITADAS
    // ==========================================

    if (!torneoEncontrado.inscripcionesHabilitadas) {
      return res.status(400).json({
        mensaje: "Las inscripciones para este torneo están cerradas.",
      });
    }

    // ==========================================
    // VALIDAR FECHA DE INICIO
    // ==========================================

    const ahora = new Date();

    if (
      torneoEncontrado.inscripcionDesde &&
      ahora < torneoEncontrado.inscripcionDesde
    ) {
      return res.status(400).json({
        mensaje: "Las inscripciones todavía no están abiertas.",
      });
    }

    // ==========================================
    // VALIDAR FECHA DE FINALIZACIÓN
    // ==========================================

    if (
      torneoEncontrado.inscripcionHasta &&
      ahora > torneoEncontrado.inscripcionHasta
    ) {
      return res.status(400).json({
        mensaje: "El período de inscripción ya finalizó.",
      });
    }

    // ==========================================
    // VALIDAR COMPETIDORES
    // ==========================================

    const categoriasDisponibles = torneoEncontrado.categorias.map((categoria) =>
      categoria.trim().toLowerCase()
    );

    for (const competidor of competidores) {
      if (
        !competidor.nombre ||
        !competidor.apellido ||
        !competidor.sexo ||
        !competidor.categoria ||
        competidor.peso === undefined ||
        competidor.peso === null ||
        competidor.peso === ""
      ) {
        return res.status(400).json({
          mensaje:
            "Todos los datos obligatorios de cada competidor deben estar completos.",
        });
      }

      // ==========================================
      // VALIDAR CATEGORÍA
      // ==========================================

      const categoriaValida = categoriasDisponibles.includes(
        competidor.categoria.trim().toLowerCase()
      );

      if (!categoriaValida) {
        return res.status(400).json({
          mensaje: `La categoría "${competidor.categoria}" no pertenece a este torneo.`,
        });
      }

      // ==========================================
      // VALIDAR PESO
      // ==========================================

      if (Number.isNaN(Number(competidor.peso))) {
        return res.status(400).json({
          mensaje: `El peso de ${competidor.nombre} ${competidor.apellido} no es válido.`,
        });
      }

      if (Number(competidor.peso) <= 0) {
        return res.status(400).json({
          mensaje: `El peso de ${competidor.nombre} ${competidor.apellido} debe ser mayor a 0.`,
        });
      }
    }

    // ==========================================
    // PREPARAR INSCRIPCIONES
    // ==========================================

    const inscripciones = competidores.map((competidor) => ({
      torneo,
      institucion: institucion.trim(),
      instructorDelegado: instructorDelegado.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(),
      documentoResponsable: documentoResponsable?.trim() || "",

      nombre: competidor.nombre.trim(),
      apellido: competidor.apellido.trim(),
      sexo: competidor.sexo,
      categoria: competidor.categoria.trim(),
      peso: Number(competidor.peso),

      aceptaPoliticaDatos: true,
    }));

    // ==========================================
    // CREAR INSCRIPCIONES
    // ==========================================

    try {
      const creadas = await Inscripcion.insertMany(inscripciones, {
        ordered: true,
      });

      return res.status(201).json({
        mensaje: "Inscripción registrada correctamente.",
        cantidad: creadas.length,
        inscripciones: creadas,
      });
    } catch (error) {
      // ==========================================
      // DUPLICADO
      // ==========================================

      if (error.code === 11000) {
        return res.status(409).json({
          mensaje:
            "Uno de los competidores ya está inscripto en esa categoría para este torneo.",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Error creando inscripción:", error);

    return res.status(500).json({
      mensaje: "Error interno al registrar la inscripción.",
    });
  }
};

export default crearInscripcion;