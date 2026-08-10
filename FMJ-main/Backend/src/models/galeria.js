import mongoose from "mongoose";

const galeriaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      trim: true,
      default: "",
    },

    imagen: {
      type: String,
      required: true,
    },

    cloudinaryPublicId: {
      type: String,
      required: true,
    },

    fecha: {
      type: Date,
      required: true,
      default: Date.now,
    },

    activo: {
      type: Boolean,
      default: true,
    },
    likes: {
  type: [String],
  default: [],
},
  },
  
  {
    timestamps: true,
  }
);

export default mongoose.model("Galeria", galeriaSchema);