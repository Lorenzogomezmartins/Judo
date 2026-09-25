import mongoose from "mongoose";

const torneoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    tipo: {
      type: String,
      enum: ["torneo", "curso", "capacitacion", "evento"],
      default: "torneo",
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    resultadosSubidos: {
  type: Boolean,
  default: false,
},

    fecha: {
      type: Date,
      required: true,
    },

    descripcion: {
      type: String,
      default: "",
    },

    fotos: [
      {
        type: String,
      },
    ],

    direccion: {
      type: String,
      default: "",
    },

    reglas: {
      type: String,
      default: "",
    },

    transmisiones: [
      {
        titulo: {
          type: String,
          default: "",
        },

        url: {
          type: String,
          required: true,
        },
      },
    ],

    categorias: [
      {
        type: String,
      },
    ],

    // ==========================================
    // INSCRIPCIONES
    // ==========================================

    inscripcionesHabilitadas: {
      type: Boolean,
      default: false,
    },

    inscripcionDesde: {
      type: Date,
      default: null,
    },

    inscripcionHasta: {
      type: Date,
      default: null,
    },

    // ==========================================
    // GOOGLE CALENDAR
    // ==========================================

    googleCalendarEventId: {
      type: String,
      default: "",
    },

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
  
);


const Torneo = mongoose.models.Torneo || mongoose.model("Torneo", torneoSchema);

export default Torneo;