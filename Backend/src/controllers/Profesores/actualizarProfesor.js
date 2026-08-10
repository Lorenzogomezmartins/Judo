import Profesor from "../../models/profesor.js";
import {
  subirBufferACloudinary,
  subirCvACloudinary,
} from "../../config/cloudinary.js";

const actualizarProfesor = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.capacitaciones) {
      data.capacitaciones = JSON.parse(data.capacitaciones);
    }

    if (req.files?.foto) {
  const imagen = await subirBufferACloudinary(
    req.files.foto[0].buffer,
    `profesor_${Date.now()}`
  );

  data.foto = imagen.secure_url;
}

if (req.files?.cv) {
  const archivo = await subirCvACloudinary(req.files.cv[0]);
  data.cv = archivo.secure_url;
}

    const profesor = await Profesor.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profesor) {
      return res.status(404).json({
        mensaje: "Profesor no encontrado",
      });
    }

    res.json(profesor);
  } catch (error) {
  console.error("ERROR ACTUALIZAR PROFESOR:");
  console.error(error);

  res.status(500).json({
    mensaje: error.message,
    stack: error.stack,
  });
}
};

export default actualizarProfesor;