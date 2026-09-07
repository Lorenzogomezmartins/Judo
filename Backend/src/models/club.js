// models/Club.js

import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    logoPublicId: {
      type: String,
      default: "",
    },

    ubicacion: {
      type: String,
      default: "",
      trim: true,
    },

    telefono: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    facebook: {
      type: String,
      default: "",
      trim: true,
    },

    instagram: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // RANKING
    // =========================

    puntajeTotal: {
      type: Number,
      default: 0,
    },

    ranking: {
      type: Number,
      default: 0,
    },

    // =========================
    // DATOS DE IMPORTACIÓN
    // =========================

    filaGoogleSheet: {
      type: Number,
      default: null,
    },

    datosOriginales: {
      nombre: {
        type: String,
        default: "",
      },

      logoDriveUrl: {
        type: String,
        default: "",
      },

      ubicacion: {
        type: String,
        default: "",
      },

      telefono: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      facebook: {
        type: String,
        default: "",
      },

      instagram: {
        type: String,
        default: "",
      },

      puntajeTotal: {
        type: Number,
        default: 0,
      },

      ranking: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Evita tener dos clubes con exactamente el mismo nombre.
clubSchema.index(
  { nombre: 1 },
  {
    unique: true,
    collation: {
      locale: "es",
      strength: 2,
    },
  }
);

// Facilita ordenar el ranking.
clubSchema.index({ puntajeTotal: -1 });

export default mongoose.model("Club", clubSchema);