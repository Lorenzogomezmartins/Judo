import Profesor from "../../models/profesor.js";

import {
  subirBufferACloudinary,
  subirCvACloudinary,
} from "../../config/cloudinary.js";

const crearProfesor = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      club,
      descripcion,
      rol = "profesor",
    } = req.body;

    if (!nombre || !apellido) {
      return res.status(400).json({
        mensaje: "Nombre y apellido son obligatorios",
      });
    }

    if (!["profesor", "autoridad"].includes(rol)) {
      return res.status(400).json({
        mensaje: "El rol debe ser profesor o autoridad",
      });
    }

    let capacitaciones = [];

    if (req.body.capacitaciones) {
      capacitaciones = JSON.parse(req.body.capacitaciones);
    }

    let foto = null;
    let cv = null;

    if (req.files?.foto) {
      const imagen = await subirBufferACloudinary(
        req.files.foto[0].buffer,
        `profesor_${Date.now()}`
      );

      foto = imagen.secure_url;
    }

    if (req.files?.cv) {
      const archivo = await subirCvACloudinary(req.files.cv[0]);
      cv = archivo.secure_url;
    }

    const profesor = new Profesor({
      nombre,
      apellido,
      club,
      descripcion,
      rol,
      foto,
      cv,
      capacitaciones,
    });

    await profesor.save();

    res.status(201).json(profesor);
  } catch (error) {
    console.error("ERROR CREAR PROFESOR:");
    console.error(error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

export default crearProfesor;