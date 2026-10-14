import mongoose from "mongoose";

/*
========================================
RESULTADOS DE CADA COMPETENCIA
========================================
*/

const resultadoSchema = new mongoose.Schema(
  {
    oro: {
      type: Number,
      default: 0,
    },

    plata: {
      type: Number,
      default: 0,
    },

    bronce: {
      type: Number,
      default: 0,
    },

    quinto: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

/*
========================================
MODELO CLUB
========================================
*/

const clubSchema = new mongoose.Schema(
  {
    /*
    ------------------------------------
    IDENTIFICACIÓN
    ------------------------------------
    */

    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    /*
    ------------------------------------
    COMPETENCIAS
    ------------------------------------
    */

    abiertoCiudad2026: {
      type: resultadoSchema,
      default: () => ({}),
    },

    juegosPortenos2026: {
      type: resultadoSchema,
      default: () => ({}),
    },

    copaDoblas2026: {
      type: resultadoSchema,
      default: () => ({}),
    },

    // NUEVO: Juegos UFeDeM
    // (mismo nombre que en el ranking de judokas: juegosUFedem2026)
    juegosUFedem2026: {
      type: resultadoSchema,
      default: () => ({}),
    },

    torneoMetropolitano2026: {
      type: resultadoSchema,
      default: () => ({}),
    },

    medalleroGlobal: {
      type: resultadoSchema,
      default: () => ({}),
    },

    /*
    ------------------------------------
    INFORMACIÓN DEL CLUB
    ------------------------------------
    */

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
    },

    telefono: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    facebook: {
      type: String,
      default: "",
    },

    instagram: {
      type: String,
      default: "",
    },

    ubicacionMaps: {
      type: String,
      default: "",
    },

    /*
    ------------------------------------
    RANKING

    Este valor viene directamente de la
    columna "Ranking" de la planilla.

    NO calculamos el ranking nosotros.
    ------------------------------------
    */

    ranking: {
      type: Number,
      default: 0,
    },

    /*
    ------------------------------------
    GOOGLE SHEETS
    ------------------------------------
    */

    filaGoogleSheet: {
      type: Number,
      default: null,
    },

    /*
    ------------------------------------
    DATOS ORIGINALES

    Sirve para conservar información
    proveniente directamente de Sheets.
    ------------------------------------
    */

    datosOriginales: {
      institucion: {
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

      ubicacionMaps: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

/*
========================================
ÍNDICES
========================================
*/

clubSchema.index(
  {
    nombre: 1,
  },
  {
    unique: true,
    collation: {
      locale: "es",
      strength: 2,
    },
  }
);

clubSchema.index({
  ranking: 1,
});

/*
========================================
EXPORT
========================================
*/

export default mongoose.models.Club ||
  mongoose.model("Club", clubSchema);