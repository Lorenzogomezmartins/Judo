// models/InscripcionUsuario.js
import mongoose from "mongoose";

const inscripcionUsuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },

    dni: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },

    sexo: {
      type: String,
      enum: ["masculino", "femenino", "otro"],
      required: true,
    },

    peso: { type: Number, required: true },

    clasificacion: {
      type: String,
      enum: ["senior", "cadete", "junior", "infantil-b"],
      required: true,
    },

    Puntos: {
      type: Number,
      default: 0,
    },

    fotoDriveUrl: { type: String },
    fotoDriveId: { type: String },

    estado: {
      type: String,
      enum: ["pendiente", "aprobado", "rechazado", "duplicado", "error"],
      default: "pendiente",
    },

    observacion: { type: String, default: "" },

    origen: {
      type: String,
      default: "google_form",
    },

    filaGoogleSheet: { type: Number },

    usuarioCreado: {
      type: Boolean,
      default: false,
    },

    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },

    datosOriginales: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("InscripcionUsuario", inscripcionUsuarioSchema);