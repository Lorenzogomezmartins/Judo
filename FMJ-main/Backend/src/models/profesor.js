// models/profesor.js
import mongoose from "mongoose";

const capacitacionSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },

    club: {
      type: String,
      required: true,
      trim: true,
    },

    fecha: {
      type: Date,
    },

    descripcion: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const profesorSchema = new mongoose.Schema(
  {
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

    club: {
  type: String,
  trim: true,
},

    foto: {
      type: String,
    },

    descripcion: {
      type: String,
      trim: true,
    },

    cv: {
  type: String,
  default: null,
},

    capacitaciones: {
      type: [capacitacionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Profesor", profesorSchema);