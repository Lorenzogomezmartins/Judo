// src/controllers/inscripciones/importarInscripciones.controller.js
import InscripcionUsuario from '../../models/InscripcionUsuario.js';
import Usuario from '../../models/Usuario.js';
import { obtenerFilasInscripciones } from '../../config/google.js';
import { mapearFila, validarInscripcion } from './helpersInscripciones.js';

function normalizarDni(valor = '') {
  return String(valor).trim().replace(/\D/g, '');
}

function normalizarEmail(valor = '') {
  return String(valor).trim().toLowerCase();
}

function normalizarPuntos(valor = 0) {
  const numero = Number(valor);
  return Number.isNaN(numero) ? 0 : numero;
}

export async function importarInscripcionesDesdeSheets(req, res) {
  try {
    const filas = await obtenerFilasInscripciones();

    if (!filas.length) {
      return res.status(400).json({
        mensaje: 'La planilla está vacía',
      });
    }

    const headers = filas[0];
    const filasDatos = filas.slice(1);

    let creadas = 0;
    let duplicadas = 0;
    let actualizadas = 0;
    const errores = [];

    const vistosEnEstaImportacion = new Set();

    for (let i = 0; i < filasDatos.length; i++) {
      const numeroFilaReal = i + 2;

      try {
        const inscripcionMapeada = mapearFila(
          headers,
          filasDatos[i],
          numeroFilaReal
        );

        inscripcionMapeada.dni = normalizarDni(inscripcionMapeada.dni);
        inscripcionMapeada.email = normalizarEmail(inscripcionMapeada.email);
        inscripcionMapeada.Puntos = normalizarPuntos(inscripcionMapeada.Puntos);

        const errorValidacion = validarInscripcion(inscripcionMapeada);

        if (errorValidacion) {
          errores.push({
            fila: numeroFilaReal,
            error: errorValidacion,
          });
          continue;
        }

        const claveDuplicado = `${inscripcionMapeada.dni}-${inscripcionMapeada.email}`;

        if (vistosEnEstaImportacion.has(claveDuplicado)) {
          duplicadas++;
          continue;
        }

        vistosEnEstaImportacion.add(claveDuplicado);

        const existeInscripcion = await InscripcionUsuario.findOne({
          $or: [
            { dni: inscripcionMapeada.dni },
            { email: inscripcionMapeada.email },
            { filaGoogleSheet: numeroFilaReal },
          ],
        });

        const existeUsuario = await Usuario.findOne({
          $or: [
            { dni: inscripcionMapeada.dni },
            { email: inscripcionMapeada.email },
          ],
        });

        if (existeInscripcion) {
          existeInscripcion.Puntos = inscripcionMapeada.Puntos;
          existeInscripcion.datosOriginales = inscripcionMapeada;

          await existeInscripcion.save();

          duplicadas++;
          actualizadas++;
          continue;
        }

        if (existeUsuario) {
          existeUsuario.Puntos = inscripcionMapeada.Puntos;

          await existeUsuario.save();

          duplicadas++;
          actualizadas++;
          continue;
        }

        await InscripcionUsuario.create({
          ...inscripcionMapeada,
          Puntos: inscripcionMapeada.Puntos,
          estado: 'pendiente',
          datosOriginales: inscripcionMapeada,
        });

        creadas++;
      } catch (error) {
        errores.push({
          fila: numeroFilaReal,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      mensaje: 'Importación finalizada',
      creadas,
      duplicadas,
      actualizadas,
      errores,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error importando inscripciones desde Google Sheets',
      error: error.message,
    });
  }
}