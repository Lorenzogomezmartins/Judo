// models/Patrocinador.js
import mongoose from 'mongoose';

const patrocinadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  logo: { type: String },
  contacto: { type: String },
  sitioWeb: { type: String },
});

export default mongoose.model('Patrocinador', patrocinadorSchema);
