// models/Usuario.js
import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  dni: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  sexo: { type: String, enum: ['masculino', 'femenino', 'otro'], required: true },
  clasificacion: { type: String, enum: ['senior','cadete','junior','infantil-b'], required: true },

  // opcional: histórico de puntos
  historialTorneos: [{
    torneo: { type: mongoose.Schema.Types.ObjectId, ref: 'Torneo' },
    puesto: { type: Number },
    puntos: { type: Number }
  }]
});

export default mongoose.model('Usuario', usuarioSchema);
