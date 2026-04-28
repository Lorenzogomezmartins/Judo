// src/controllers/inscripciones/actualizarInscripcion.controller.js
import InscripcionUsuario from '../../models/InscripcionUsuario.js';
import {
  normalizarTexto,
  normalizarTextoMinuscula,
  normalizarNumero,
} from './helpersInscripciones.js';

export async function actualizarInscripcion(req, res) {
  try {
    const { id } = req.params;

    const camposPermitidos = [
      'nombre',
      'apellido',
      'dni',
      'email',
      'telefono',
      'sexo',
      'peso',
      'Puntos',
      'clasificacion',
      'observacion',
    ];

    const datosActualizados = {};

    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        datosActualizados[campo] = req.body[campo];
      }
    });

    if (datosActualizados.nombre !== undefined) {
      datosActualizados.nombre = normalizarTexto(datosActualizados.nombre);
    }

    if (datosActualizados.apellido !== undefined) {
      datosActualizados.apellido = normalizarTexto(datosActualizados.apellido);
    }

    if (datosActualizados.dni !== undefined) {
      datosActualizados.dni = normalizarTexto(datosActualizados.dni);
    }

    if (datosActualizados.email !== undefined) {
      datosActualizados.email = normalizarTextoMinuscula(
        datosActualizados.email
      );
    }

    if (datosActualizados.telefono !== undefined) {
      datosActualizados.telefono = normalizarTexto(datosActualizados.telefono);
    }

    if (datosActualizados.sexo !== undefined) {
      datosActualizados.sexo = normalizarTextoMinuscula(datosActualizados.sexo);
    }

    if (datosActualizados.clasificacion !== undefined) {
      datosActualizados.clasificacion = normalizarTextoMinuscula(
        datosActualizados.clasificacion
      );
    }

    if (datosActualizados.peso !== undefined) {
      datosActualizados.peso = normalizarNumero(datosActualizados.peso);
    }

    if (datosActualizados.Puntos !== undefined) {
      datosActualizados.Puntos = normalizarNumero(datosActualizados.Puntos);
    }

    const inscripcion = await InscripcionUsuario.findByIdAndUpdate(
      id,
      datosActualizados,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!inscripcion) {
      return res.status(404).json({
        mensaje: 'Inscripción no encontrada',
      });
    }

    return res.status(200).json({
      mensaje: 'Inscripción actualizada correctamente',
      inscripcion,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error actualizando inscripción',
      error: error.message,
    });
  }
}