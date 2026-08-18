import mongoose from "mongoose";

const inscripcionSchema = new mongoose.Schema(
  {
    // ==========================================
    // TORNEO
    // ==========================================

    torneo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Torneo",
      required: true,
      index: true,
    },

    // ==========================================
    // DATOS DE LA INSTITUCIÓN
    // ==========================================

    institucion: {
      type: String,
      required: true,
      trim: true,
    },

    instructorDelegado: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    telefono: {
      type: String,
      required: true,
      trim: true,
    },

    documentoResponsable: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // DATOS DEL COMPETIDOR
    // ==========================================

    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    apellido: {
      type: String,
      required: true,
      trim: true,
    },

    sexo: {
      type: String,
      enum: ["masculino", "femenino"],
      required: true,
    },

    categoria: {
      type: String,
      required: true,
      trim: true,
    },

    peso: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // CONSENTIMIENTO
    // ==========================================

    aceptaPoliticaDatos: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: "Debe aceptar la política de tratamiento de datos.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// EVITAR DUPLICADOS
// ==========================================
//
// El mismo competidor no puede inscribirse
// dos veces en la misma categoría del mismo torneo.
//
// Sí puede estar en distintas categorías.
//

inscripcionSchema.index(
  {
    torneo: 1,
    nombre: 1,
    apellido: 1,
    categoria: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("Inscripcion", inscripcionSchema);