// src/controllers/inscripciones/helpersInscripciones.js
import { extraerDriveId } from '../../config/google.js';

export function normalizarTexto(valor = '') {
  return String(valor).trim();
}

export function normalizarTextoMinuscula(valor = '') {
  return normalizarTexto(valor).toLowerCase();
}

export function normalizarNumero(valor = '') {
  const limpio = String(valor).replace(',', '.').trim();
  const numero = Number(limpio);

  return Number.isNaN(numero) ? 0 : numero;
}

export function mapearFila(headers, fila, numeroFilaReal) {
  const obj = {};

  headers.forEach((header, index) => {
    const clave = String(header).trim().toLowerCase();
    obj[clave] = fila[index] || '';
  });

  const fotoDriveUrl =
    obj['foto del rostro'] ||
    obj['foto'] ||
    obj['ft'] ||
    obj['imagen'] ||
    obj['foto de perfil'] ||
    '';

  const fotoDriveId = extraerDriveId(fotoDriveUrl);

  return {
    nombre: normalizarTexto(obj['nombre']),
    apellido: normalizarTexto(obj['apellido']),
    dni: normalizarTexto(obj['dni']),
    email: normalizarTextoMinuscula(
      obj['email'] ||
        obj['correo'] ||
        obj['mail'] ||
        obj['correo electrónico'] ||
        obj['correo electronico']
    ),
    telefono: normalizarTexto(obj['teléfono'] || obj['telefono']),
    sexo: normalizarTextoMinuscula(obj['sexo']),
    peso: normalizarNumero(obj['peso']),

    // IMPORTANTE: el modelo usa Puntos con mayúscula
    Puntos: normalizarNumero(
      obj['puntos'] ||
        obj['punto'] ||
        obj['puntaje'] ||
        obj['ranking'] ||
        0
    ),

    clasificacion: normalizarTextoMinuscula(
      obj['clasificación'] || obj['clasificacion']
    ),
    fotoDriveUrl,
    fotoDriveId,
    filaGoogleSheet: numeroFilaReal,
  };
}

export function validarInscripcion(inscripcion) {
  if (!inscripcion.nombre) return 'Falta nombre';
  if (!inscripcion.apellido) return 'Falta apellido';
  if (!inscripcion.dni) return 'Falta DNI';
  if (!inscripcion.email) return 'Falta email';
  if (!inscripcion.telefono) return 'Falta teléfono';
  if (!inscripcion.sexo) return 'Falta sexo';

  if (!inscripcion.peso || Number.isNaN(inscripcion.peso)) {
    return 'Peso inválido';
  }

  if (!inscripcion.clasificacion) return 'Falta clasificación';

  const sexosValidos = ['masculino', 'femenino', 'otro'];
  const clasificacionesValidas = ['senior', 'cadete', 'junior', 'infantil-b'];

  if (!sexosValidos.includes(inscripcion.sexo)) {
    return 'Sexo inválido';
  }

  if (!clasificacionesValidas.includes(inscripcion.clasificacion)) {
    return 'Clasificación inválida';
  }

  return null;
}