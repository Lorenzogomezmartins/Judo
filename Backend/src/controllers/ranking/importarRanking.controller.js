import RankingUsuario from "../../models/RankingUsuario.js";

import {
  obtenerFilasInscripciones,
  descargarArchivoDrive,
  extraerDriveId,
} from "../../config/google.js";

import { subirBufferACloudinary } from "../../config/cloudinary.js";

function normalizarTexto(valor = "") {
  return String(valor).trim();
}

function normalizarDni(valor = "") {
  return String(valor).trim().replace(/\D/g, "");
}

function normalizarNumero(valor = "") {
  const limpio = String(valor).replace(",", ".").trim();
  const numero = Number(limpio);

  return Number.isNaN(numero) ? 0 : numero;
}

function normalizarSexo(valor = "") {
  return String(valor).trim().toLowerCase();
}

function hayCambios(usuarioExistente, datosNuevos) {
  if (!usuarioExistente) return true;

  return (
    usuarioExistente.apellido !== datosNuevos.apellido ||
    usuarioExistente.nombre !== datosNuevos.nombre ||
    usuarioExistente.institucion !== datosNuevos.institucion ||
    usuarioExistente.categoria !== datosNuevos.categoria ||
    usuarioExistente.clave !== datosNuevos.clave ||
    Number(usuarioExistente.peso || 0) !== Number(datosNuevos.peso || 0) ||
    usuarioExistente.sexo !== datosNuevos.sexo ||
    Number(usuarioExistente.puntajeTotal || 0) !==
      Number(datosNuevos.puntajeTotal || 0) ||
    usuarioExistente.abiertoCiudad2025?.posicion !==
      datosNuevos.abiertoCiudad2025.posicion ||
    Number(usuarioExistente.abiertoCiudad2025?.puntaje || 0) !==
      Number(datosNuevos.abiertoCiudad2025.puntaje || 0) ||
    usuarioExistente.torneoMetropolitano2025?.posicion !==
      datosNuevos.torneoMetropolitano2025.posicion ||
    Number(usuarioExistente.torneoMetropolitano2025?.puntaje || 0) !==
      Number(datosNuevos.torneoMetropolitano2025.puntaje || 0)
  );
}

/*
  Esta es la función REAL de importación.
  La usamos tanto desde el botón manual como desde el setInterval automático.
*/
export async function ejecutarImportacionRanking() {
  const filas = await obtenerFilasInscripciones();

  if (!filas.length) {
    throw new Error("La planilla está vacía");
  }

  // Tu Excel tiene encabezado doble, entonces los datos empiezan desde la fila 3
  const filasDatos = filas.slice(2);

  let creadas = 0;
  let actualizadas = 0;
  let sinCambios = 0;
  let omitidasSinDni = 0;
  let omitidasSinFoto = 0;

  const errores = [];

  for (let i = 0; i < filasDatos.length; i++) {
    const fila = filasDatos[i];
    const numeroFilaReal = i + 3;

    try {
      const dni = normalizarDni(fila[0]);
      const apellido = normalizarTexto(fila[1]);
      const nombre = normalizarTexto(fila[2]);
      const institucion = normalizarTexto(fila[3]);
      const categoria = normalizarTexto(fila[4]);
      const clave = normalizarTexto(fila[5]);

      const abiertoPosicion = normalizarTexto(fila[6]);
      const abiertoPuntaje = normalizarNumero(fila[7]);

      const metropolitanoPosicion = normalizarTexto(fila[8]);
      const metropolitanoPuntaje = normalizarNumero(fila[9]);

      const puntajeTotal = normalizarNumero(fila[10]);
      const fotoDriveUrl = normalizarTexto(fila[11]);

      // Si después agregás Peso y Sexo al Excel, usá estas columnas
      const peso = normalizarNumero(fila[12]);
      const sexo = normalizarSexo(fila[13]);

      if (!dni) {
        omitidasSinDni++;

        errores.push({
          fila: numeroFilaReal,
          error: "No se importó porque no tiene DNI",
        });

        continue;
      }

      if (!fotoDriveUrl) {
        omitidasSinFoto++;

        errores.push({
          fila: numeroFilaReal,
          error: "No se importó porque no tiene foto",
        });

        continue;
      }

      const fotoDriveId = extraerDriveId(fotoDriveUrl);

      if (!fotoDriveId) {
        omitidasSinFoto++;

        errores.push({
          fila: numeroFilaReal,
          error: "No se importó porque la foto no tiene un link válido de Drive",
        });

        continue;
      }

      const datosSinFotoCloudinary = {
        dni,
        apellido,
        nombre,
        institucion,
        categoria,
        clave,

        peso,
        sexo,

        abiertoCiudad2025: {
          posicion: abiertoPosicion,
          puntaje: abiertoPuntaje,
        },

        torneoMetropolitano2025: {
          posicion: metropolitanoPosicion,
          puntaje: metropolitanoPuntaje,
        },

        puntajeTotal,

        filaGoogleSheet: numeroFilaReal,

        datosOriginales: {
          dni,
          apellido,
          nombre,
          institucion,
          categoria,
          clave,
          abiertoPosicion,
          abiertoPuntaje,
          metropolitanoPosicion,
          metropolitanoPuntaje,
          puntajeTotal,
          fotoDriveUrl,
          peso,
          sexo,
        },
      };

      const usuarioExistente = await RankingUsuario.findOne({ dni });

      const cambioDatos = hayCambios(
        usuarioExistente,
        datosSinFotoCloudinary
      );

      // Si ya existe y no cambió nada, no hace nada.
      // No duplica, no vuelve a subir foto, no pisa innecesariamente.
      if (usuarioExistente && !cambioDatos) {
        sinCambios++;
        continue;
      }

      let foto = usuarioExistente?.foto || "";
      let fotoPublicId = usuarioExistente?.fotoPublicId || "";

      const imagenBuffer = await descargarArchivoDrive(fotoDriveId);

      const resultadoCloudinary = await subirBufferACloudinary(
        imagenBuffer,
        dni
      );

      foto = resultadoCloudinary.secure_url;
      fotoPublicId = resultadoCloudinary.public_id;

      await RankingUsuario.findOneAndUpdate(
        { dni },
        {
          ...datosSinFotoCloudinary,
          foto,
          fotoPublicId,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      if (usuarioExistente) {
        actualizadas++;
      } else {
        creadas++;
      }
    } catch (error) {
      errores.push({
        fila: numeroFilaReal,
        error: error.message,
      });
    }
  }

  return {
    mensaje: "Importación de ranking finalizada",
    creadas,
    actualizadas,
    sinCambios,
    omitidasSinDni,
    omitidasSinFoto,
    errores,
  };
}

/*
  Endpoint manual.
  Este lo usa el botón importar o Postman.
*/
export async function importarRankingDesdeSheets(req, res) {
  try {
    const resultado = await ejecutarImportacionRanking();

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error importando ranking desde Google Sheets",
      error: error.message,
    });
  }
}