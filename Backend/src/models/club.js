import mongoose from "mongoose";

const resultadoSchema = new mongoose.Schema(
  {
    oro: { type: Number, default: 0 },
    plata: { type: Number, default: 0 },
    bronce: { type: Number, default: 0 },
    quinto: { type: Number, default: 0 },
  },
  { _id: false }
);

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

    telefono: {
      type: String,
      default: "",
    },

    direccion: {
      type: String,
      default: "",
    },

    sitioWeb: {
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

    torneoMetropolitano2026: {
      type: resultadoSchema,
      default: () => ({}),
    },

    medalleroGlobal: {
      type: resultadoSchema,
      default: () => ({}),
    },

    ranking: {
      type: Number,
      default: 0,
    },

    filaGoogleSheet: {
      type: Number,
      default: null,
    },

    datosOriginales: {
      institucion: String,
      fotoDriveUrl: String,
    },
  },
  {
    timestamps: true,
  }
);

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

clubSchema.index({ ranking: 1 });

export default mongoose.model("Club", clubSchema);