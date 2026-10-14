import mongoose from "mongoose";

const rankingUsuarioSchema = new mongoose.Schema(
  {
    dni: { type: String, required: true },

    apellido: { type: String, required: true },
    nombre: { type: String, required: true },
    institucion: { type: String },
    categoria: { type: String },
    clave: { type: String },

    peso: { type: Number },
    sexo: { type: String },

    abiertoCiudad2026: {
      posicion: { type: String },
      puntaje: { type: Number, default: 0 },
    },

    juegosPortenos2026: {
  posicion: { type: String },
  puntaje: { type: Number, default: 0 },
},

juegosUFedem2026: {
  posicion: { type: String },
  puntaje: { type: Number, default: 0 },
},

    copaDoblas2026: {
      posicion: { type: String },
      puntaje: { type: Number, default: 0 },
    },

    torneoMetropolitano2026: {
      posicion: { type: String },
      puntaje: { type: Number, default: 0 },
    },

    puntajeTotal: { type: Number, default: 0 },

ranking: { type: Number },

foto: { type: String },

    fotoPublicId: { type: String },

    filaGoogleSheet: { type: Number },

    datosOriginales: { type: Object },
  },
  { timestamps: true }
);

/*
  Un mismo DNI puede aparecer en varias categorías.

  Ejemplo válido:

  MJ2809472 + J15M-60
  MJ2809472 + J15M-66

  Pero esto NO puede repetirse:

  MJ2809472 + J15M-60
  MJ2809472 + J15M-60
*/
rankingUsuarioSchema.index(
  { dni: 1, categoria: 1 },
  { unique: true }
);

export default mongoose.model("RankingUsuario", rankingUsuarioSchema);