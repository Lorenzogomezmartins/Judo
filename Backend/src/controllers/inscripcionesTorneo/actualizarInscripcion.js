import Inscripcion from "../../models/inscripcion.js";
import Torneo from "../../models/Torneo.js";

const actualizarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      institucion,
      instructorDelegado,
      email,
      telefono,
      documentoResponsable,
      nombre,
      apellido,
      sexo,
      categoria,
      peso,
    } = req.body;

    // ==========================================
    // BUSCAR INSCRIPCIÓN
    // ==========================================

    const inscripcion = await Inscripcion.findById(id);

    if (!inscripcion) {
      return res.status(404).json({
        mensaje: "Inscripción no encontrada.",
      });
    }

    // ==========================================
    // BUSCAR TORNEO
    // ==========================================

    const torneo = await Torneo.findById(inscripcion.torneo);

    if (!torneo) {
      return res.status(404).json({
        mensaje: "El torneo asociado no existe.",
      });
    }

    // ==========================================
    // VALIDAR DATOS OBLIGATORIOS
    // ==========================================

    if (
      !institucion ||
      !instructorDelegado ||
      !email ||
      !telefono ||
      !nombre ||
      !apellido ||
      !sexo ||
      !categoria ||
      peso === undefined ||
      peso === null ||
      peso === ""
    ) {
      return res.status(400).json({
        mensaje: "Todos los campos obligatorios deben estar completos.",
      });
    }

    // ==========================================
    // VALIDAR CATEGORÍA
    // ==========================================

    const categoriaValida = torneo.categorias.some(
      (categoriaTorneo) =>
        categoriaTorneo.trim().toLowerCase() ===
        categoria.trim().toLowerCase()
    );

    if (!categoriaValida) {
      return res.status(400).json({
        mensaje:
          "La categoría seleccionada no pertenece al torneo.",
      });
    }

    // ==========================================
    // VALIDAR PESO
    // ==========================================

    const pesoNumero = Number(peso);

    if (Number.isNaN(pesoNumero) || pesoNumero <= 0) {
      return res.status(400).json({
        mensaje: "El peso debe ser un número mayor a 0.",
      });
    }

    // ==========================================
    // COMPROBAR DUPLICADO
    // ==========================================
    //
    // Si se modifica nombre, apellido o categoría,
    // comprobamos que no exista otro registro igual.
    //

    const duplicado = await Inscripcion.findOne({
      _id: { $ne: id },

      torneo: inscripcion.torneo,

      nombre: {
        $regex: `^${nombre.trim()}$`,
        $options: "i",
      },

      apellido: {
        $regex: `^${apellido.trim()}$`,
        $options: "i",
      },

      categoria: {
        $regex: `^${categoria.trim()}$`,
        $options: "i",
      },
    });

    if (duplicado) {
      return res.status(409).json({
        mensaje:
          "Ya existe otro competidor con ese nombre, apellido y categoría en este torneo.",
      });
    }

    // ==========================================
    // ACTUALIZAR
    // ==========================================

    inscripcion.institucion = institucion.trim();
    inscripcion.instructorDelegado = instructorDelegado.trim();
    inscripcion.email = email.trim().toLowerCase();
    inscripcion.telefono = telefono.trim();
    inscripcion.documentoResponsable =
      documentoResponsable?.trim() || "";

    inscripcion.nombre = nombre.trim();
    inscripcion.apellido = apellido.trim();
    inscripcion.sexo = sexo;
    inscripcion.categoria = categoria.trim();
    inscripcion.peso = pesoNumero;

    await inscripcion.save();

    // ==========================================
    // RESPUESTA
    // ==========================================

    res.json({
      mensaje: "Inscripción actualizada correctamente.",
      inscripcion,
    });
  } catch (error) {
    console.error("Error actualizando inscripción:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        mensaje:
          "Ya existe otro competidor con esos datos en la misma categoría.",
      });
    }

    res.status(500).json({
      mensaje: "Error al actualizar la inscripción.",
    });
  }
};

export default actualizarInscripcion;