// models/Administrador.js
import mongoose from 'mongoose';

const administradorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'superadmin'], required: true },
});

export default mongoose.model('Administrador', administradorSchema);
