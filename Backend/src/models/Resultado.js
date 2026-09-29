import mongoose from "mongoose";

const resultadoSchema = new mongoose.Schema(
  {
    torneoSlug: {
      type: String,
      required: true,
      index: true,
    },

    torneoNombre: {
      type: String,
      required: true,
    },

    anio: {
      type: Number,
      required: true,
      index: true,
    },

    carpetaFTP: {
      type: String,
      required: true,
    },

    archivoNombre: {
      type: String,
      required: true,
    },

    rutaFTP: {
      type: String,
      
    },

    hashArchivo: {
      type: String,
      required: true,
    },

    tipoArchivo: {
      type: String,
      default: "html",
    },

    contenidoOriginal: {
      type: String,
      required: true,
    },

    importadoEn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Resultado", resultadoSchema);