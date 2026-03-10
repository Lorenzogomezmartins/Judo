// models/Torneo.js
import mongoose from 'mongoose';

const torneoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  fotos: [{ type: String }],
  direccion: { type: String },
  fecha: { type: Date, required: true },
  colorCalendario: { type: String },
  reglas: { type: String },

  // Usuarios inscritos
  inscripciones: [{
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fechaInscripcion: { type: Date, default: Date.now },
    puesto: { type: Number }, // puesto obtenido
    puntos: { type: Number }  // puntos obtenidos según puesto
  }],
});

export default mongoose.model('Torneo', torneoSchema);
