// models/profesor.js
import mongoose from 'mongoose';

const profesorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  foto: { type: String },
  descripcion: { type: String },
});

export default mongoose.model('Profesor', profesorSchema);
