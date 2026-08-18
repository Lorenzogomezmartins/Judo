import Inscripcion from "../../models/inscripcion.js";

const escaparCSV = (valor) => {
  if (valor === null || valor === undefined) {
    return "";
  }

  const texto = String(valor);

  return `"${texto.replace(/"/g, '""')}"`;
};

const exportarInscripcionesCSV = async (req, res) => {
  try {
    const {
      torneo,
      nombre,
      categoria,
      peso,
      institucion,
    } = req.query;

    // ==========================================
    // EL TORNEO ES OBLIGATORIO
    // ==========================================

    if (!torneo) {
      return res.status(400).json({
        mensaje:
          "Debés indicar el torneo que querés exportar.",
      });
    }

    const filtro = {
      torneo,
    };

    // ==========================================
    // FILTROS
    // ==========================================

    if (nombre) {
      filtro.$or = [
        {
          nombre: {
            $regex: nombre.trim(),
            $options: "i",
          },
        },
        {
          apellido: {
            $regex: nombre.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (categoria) {
      filtro.categoria = {
        $regex: categoria.trim(),
        $options: "i",
      };
    }

    if (peso !== undefined && peso !== "") {
      const pesoNumero = Number(peso);

      if (Number.isNaN(pesoNumero)) {
        return res.status(400).json({
          mensaje: "El peso indicado no es válido.",
        });
      }

      filtro.peso = pesoNumero;
    }

    if (institucion) {
      filtro.institucion = {
        $regex: institucion.trim(),
        $options: "i",
      };
    }

    // ==========================================
    // BUSCAR INSCRIPCIONES
    // ==========================================

    const inscripciones = await Inscripcion.find(filtro)
      .populate("torneo", "nombre fecha")
      .sort({
        apellido: 1,
        nombre: 1,
      });

    if (!inscripciones.length) {
      return res.status(404).json({
        mensaje:
          "No hay inscripciones para exportar con los filtros seleccionados.",
      });
    }

    // ==========================================
    // ENCABEZADOS CSV
    // ==========================================

    const encabezados = [
      "Torneo",
      "Fecha del torneo",
      "Institución",
      "Instructor / Delegado",
      "Email",
      "Teléfono",
      "Documento responsable",
      "Nombre",
      "Apellido",
      "Sexo",
      "Categoría",
      "Peso",
      "Fecha de inscripción",
    ];

    const filas = inscripciones.map((inscripcion) => {
      return [
        inscripcion.torneo?.nombre || "",
        inscripcion.torneo?.fecha
          ? new Date(inscripcion.torneo.fecha).toLocaleDateString("es-AR")
          : "",
        inscripcion.institucion,
        inscripcion.instructorDelegado,
        inscripcion.email,
        inscripcion.telefono,
        inscripcion.documentoResponsable,
        inscripcion.nombre,
        inscripcion.apellido,
        inscripcion.sexo,
        inscripcion.categoria,
        inscripcion.peso,
        inscripcion.createdAt
          ? new Date(inscripcion.createdAt).toLocaleString("es-AR")
          : "",
      ];
    });

    // ==========================================
    // CREAR CSV
    // ==========================================

    const csv = [
      encabezados.map(escaparCSV).join(";"),
      ...filas.map((fila) =>
        fila.map(escaparCSV).join(";")
      ),
    ].join("\n");

    // ==========================================
    // NOMBRE DEL ARCHIVO
    // ==========================================

    const nombreTorneo =
      inscripciones[0]?.torneo?.nombre || "torneo";

    const nombreArchivo =
      nombreTorneo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();

    // ==========================================
    // HEADERS
    // ==========================================

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="inscriptos-${nombreArchivo}.csv"`
    );

    // BOM para que Excel reconozca UTF-8
    res.send("\uFEFF" + csv);
  } catch (error) {
    console.error("Error exportando CSV:", error);

    res.status(500).json({
      mensaje: "Error al generar el archivo CSV.",
    });
  }
};

export default exportarInscripcionesCSV;