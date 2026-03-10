// models/Club.js
import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  logo: { type: String },
  telefono: { type: String },
  direccion: { type: String },
  sitioWeb: { type: String },
});

export default mongoose.model('Club', clubSchema);
