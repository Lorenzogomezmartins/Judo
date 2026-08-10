import mongoose from "mongoose";

const torneoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
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

    fecha: {
      type: Date,
      required: true,
    },

    descripcion: {
      type: String,
    },

    fotos: [
      {
        type: String,
      },
    ],

    direccion: {
      type: String,
    },

    reglas: {
      type: String,
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

export default mongoose.model("Torneo", torneoSchema);