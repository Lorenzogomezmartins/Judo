// src/controllers/inscripciones/aprobarInscripcion.controller.js
import InscripcionUsuario from '../../models/InscripcionUsuario.js';
import Usuario from '../../models/usuario.js';
import { descargarArchivoDrive } from '../../config/google.js';
import { subirBufferACloudinary } from '../../config/cloudinary.js';
import { validarInscripcion } from './helpersInscripciones.js';

export async function aprobarInscripcion(req, res) {
  try {
    const { id } = req.params;

    const inscripcion = await InscripcionUsuario.findById(id);

    if (!inscripcion) {
      return res.status(404).json({
        mensaje: 'Inscripción no encontrada',
      });
    }

    if (inscripcion.estado === 'aprobado' || inscripcion.usuarioCreado) {
      return res.status(400).json({
        mensaje: 'Esta inscripción ya fue aprobada',
      });
    }

    if (inscripcion.estado === 'rechazado') {
      return res.status(400).json({
        mensaje: 'No se puede aprobar una inscripción rechazada',
      });
    }

    const errorValidacion = validarInscripcion(inscripcion);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion,
      });
    }

    const usuarioExistente = await Usuario.findOne({
      $or: [{ dni: inscripcion.dni }, { email: inscripcion.email }],
    });

    if (usuarioExistente) {
      inscripcion.estado = 'duplicado';
      inscripcion.observacion = 'Ya existe un usuario con ese DNI o email';
      await inscripcion.save();

      return res.status(400).json({
        mensaje: 'Ya existe un usuario con ese DNI o email',
      });
    }

    let ft = '';
    let ftPublicId = '';

    if (inscripcion.fotoDriveId) {
      const imagenBuffer = await descargarArchivoDrive(inscripcion.fotoDriveId);

      const resultadoCloudinary = await subirBufferACloudinary(
        imagenBuffer,
        inscripcion.dni
      );

      ft = resultadoCloudinary.secure_url;
      ftPublicId = resultadoCloudinary.public_id;
    }

    const puntosIniciales = Number(inscripcion.Puntos ?? 0);

    const usuario = await Usuario.create({
      nombre: inscripcion.nombre,
      apellido: inscripcion.apellido,
      dni: inscripcion.dni,
      email: inscripcion.email,
      telefono: inscripcion.telefono,
      sexo: inscripcion.sexo,
      peso: inscripcion.peso,
      clasificacion: inscripcion.clasificacion,
      Puntos: puntosIniciales,
      ft,
      ftPublicId,
      historialTorneos: [],
    });

    inscripcion.estado = 'aprobado';
    inscripcion.usuarioCreado = true;
    inscripcion.usuarioId = usuario._id;
    inscripcion.observacion = 'Usuario creado correctamente';
    await inscripcion.save();

    return res.status(200).json({
      mensaje: 'Inscripción aprobada y usuario creado correctamente',
      usuario,
      inscripcion,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error aprobando inscripción',
      error: error.message,
    });
  }
}