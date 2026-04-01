// models/Torneo.js
import mongoose from 'mongoose';

const torneoSchema = new mongoose.Schema({
    nombre: { 
      type: String, 
      required: true 
    },

    fotos: [
      {
        type: String
      }
    ],

    direccion: { 
      type: String 
    },

    fecha: { 
      type: Date, 
      required: true 
    },

    reglas: { 
      type: String 
    },

    categorias: [
      {
        type: String,
        //enum: ['Futbol', 'Basquet', 'Tenis', 'Padel', 'Otro']
      }
    ],

    participantes: [
      {
        nombre: { type: String, required: true },
        email: { type: String },
        equipo: { type: String },
        telefono: { type: String },
        fechaInscripcion: { 
          type: Date, 
          default: Date.now 
        }
      }
    ],

  }, {
    timestamps: true 
});
export default mongoose.model('Torneo', torneoSchema);