import mongoose from "mongoose";

const rankingUsuarioSchema = new mongoose.Schema(
  {
    dni: { type: String, required: true, unique: true },
    apellido: { type: String, required: true },
    nombre: { type: String, required: true },
    institucion: { type: String },
    categoria: { type: String },
    clave: { type: String },

    abiertoCiudad2025: {
      posicion: { type: String },
      puntaje: { type: Number, default: 0 },
    },

    torneoMetropolitano2025: {
      posicion: { type: String },
      puntaje: { type: Number, default: 0 },
    },

    puntajeTotal: { type: Number, default: 0 },

    foto: { type: String, required: true },
    fotoPublicId: { type: String },

    filaGoogleSheet: { type: Number },
    datosOriginales: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("RankingUsuario", rankingUsuarioSchema);