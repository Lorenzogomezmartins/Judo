import RankingUsuario from "../../models/RankingUsuario.js";

import {
  obtenerFilasInscripciones,
  descargarArchivoDrive,
  extraerDriveId,
} from "../../config/google.js";

import { subirBufferACloudinary } from "../../config/cloudinary.js";

const FOTO_INCOGNITO = "./assets/imagenes/incognito.jpg";

function normalizarTexto(valor = "") {
  return String(valor ?? "").trim();
}

function normalizarFotoDrive(valor = "") {
  const foto = String(valor ?? "").trim();

  if (!foto || foto.toLowerCase() === "pepito") {
    return "";
  }

  return foto;
}

function normalizarDni(valor = "") {
  return String(valor ?? "")
    .trim()
    .replace(/\D/g, "");
}

function normalizarNumero(valor = "") {
  const limpio = String(valor ?? "")
    .replace(",", ".")
    .trim();

  const numero = Number(limpio);

  return Number.isNaN(numero) ? 0 : numero;
}

function normalizarSexo(valor = "") {
  return String(valor ?? "")
    .trim()
    .toLowerCase();
}

function hayCambios(usuarioExistente, datosNuevos) {
  if (!usuarioExistente) return true;

  return (
    usuarioExistente.apellido !== datosNuevos.apellido ||
    usuarioExistente.nombre !== datosNuevos.nombre ||
    usuarioExistente.institucion !== datosNuevos.institucion ||
    usuarioExistente.categoria !== datosNuevos.categoria ||
    usuarioExistente.clave !== datosNuevos.clave ||

    Number(usuarioExistente.peso || 0) !==
      Number(datosNuevos.peso || 0) ||

    usuarioExistente.sexo !== datosNuevos.sexo ||

    Number(usuarioExistente.puntajeTotal || 0) !==
  Number(datosNuevos.puntajeTotal || 0) ||

Number(usuarioExistente.ranking || 0) !==
  Number(datosNuevos.ranking || 0) ||

usuarioExistente.abiertoCiudad2026?.posicion !==
      datosNuevos.abiertoCiudad2026.posicion ||

    Number(usuarioExistente.abiertoCiudad2026?.puntaje || 0) !==
      Number(datosNuevos.abiertoCiudad2026.puntaje || 0) ||

    usuarioExistente.copaDoblas2026?.posicion !==
      datosNuevos.copaDoblas2026.posicion ||

    Number(usuarioExistente.copaDoblas2026?.puntaje || 0) !==
      Number(datosNuevos.copaDoblas2026.puntaje || 0) ||

    usuarioExistente.torneoMetropolitano2026?.posicion !==
      datosNuevos.torneoMetropolitano2026.posicion ||

    Number(usuarioExistente.torneoMetropolitano2026?.puntaje || 0) !==
      Number(datosNuevos.torneoMetropolitano2026.puntaje || 0) ||

    usuarioExistente.datosOriginales?.fotoDriveUrl !==
      datosNuevos.datosOriginales?.fotoDriveUrl
  );
}

/*
  IMPORTACIÓN REAL DEL RANKING

  REGLA PRINCIPAL:

  DNI + CATEGORÍA identifica un registro del ranking.

  Ejemplo:

  MJ2809472 + J15M-60
  MJ2809472 + J15M-66

  Son dos registros válidos.

  El DNI identifica a la persona.
  La categoría identifica su participación dentro del ranking.
*/

export async function ejecutarImportacionRanking() {
  const filas = await obtenerFilasInscripciones();

  if (!filas.length) {
    throw new Error("La planilla está vacía");
  }

  // Los datos comienzan desde la fila 3.
  const filasDatos = filas.slice(2);

  let creadas = 0;
  let actualizadas = 0;
  let sinCambios = 0;
  let omitidasSinDni = 0;
  let erroresDuplicados = 0;

  const errores = [];

  /*
    AHORA NO CONTROLAMOS SOLO DNI.

    Controlamos DNI + categoría.

    Esto permite que una persona aparezca
    varias veces si está en categorías diferentes.
  */
  const registrosProcesados = new Set();

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

      const copaDoblasPosicion = normalizarTexto(fila[8]);
      const copaDoblasPuntaje = normalizarNumero(fila[9]);

      const metropolitanoPosicion = normalizarTexto(fila[10]);
      const metropolitanoPuntaje = normalizarNumero(fila[11]);

      const puntajeTotal = normalizarNumero(fila[12]);

      const fotoDriveUrl = normalizarFotoDrive(fila[13]);

      const ranking = normalizarNumero(fila[14]);

      const peso = normalizarNumero(fila[15]);
const sexo = normalizarSexo(fila[16]);

      /*
        DNI obligatorio.
      */
      if (!dni) {
        omitidasSinDni++;

        errores.push({
          fila: numeroFilaReal,
          error: "No se importó porque no tiene DNI",
        });

        continue;
      }

      /*
        CATEGORÍA obligatoria para poder diferenciar
        las distintas participaciones de una persona.
      */
      if (!categoria) {
        errores.push({
          fila: numeroFilaReal,
          dni,
          error: "No se importó porque no tiene categoría",
        });

        continue;
      }

      /*
        IDENTIFICADOR DEL REGISTRO:

        DNI + categoría
      */
      const claveRegistro = `${dni}|${categoria.toLowerCase()}`;

      /*
        Si aparece exactamente el mismo DNI + categoría
        dos veces en la misma planilla, ahí sí es duplicado.
      */
      if (registrosProcesados.has(claveRegistro)) {
        erroresDuplicados++;

        errores.push({
          fila: numeroFilaReal,
          dni,
          categoria,
          error: "DNI + categoría repetidos dentro de la planilla",
        });

        continue;
      }

      registrosProcesados.add(claveRegistro);

      /*
        BUSCAMOS POR DNI + CATEGORÍA.

        Esto permite:

        MJ2809472 + J15M-60

        y

        MJ2809472 + J15M-66

        como dos documentos diferentes.
      */
      const usuarioExistente = await RankingUsuario.findOne({
        dni,
        categoria,
      });

      const datosNuevos = {
        dni,

        apellido,
        nombre,
        institucion,
        categoria,
        clave,

        peso,
        sexo,

        abiertoCiudad2026: {
          posicion: abiertoPosicion,
          puntaje: abiertoPuntaje,
        },

        copaDoblas2026: {
          posicion: copaDoblasPosicion,
          puntaje: copaDoblasPuntaje,
        },

        torneoMetropolitano2026: {
          posicion: metropolitanoPosicion,
          puntaje: metropolitanoPuntaje,
        },

        puntajeTotal,

        ranking,

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

          copaDoblasPosicion,
          copaDoblasPuntaje,

          metropolitanoPosicion,
          metropolitanoPuntaje,

          puntajeTotal,

          ranking,


          fotoDriveUrl,

          peso,
          sexo,
        },
      };

      const cambioDatos = hayCambios(
        usuarioExistente,
        datosNuevos
      );

      /*
        Si existe exactamente el mismo DNI + categoría
        y no cambió nada, no hacemos nada.
      */
      if (usuarioExistente && !cambioDatos) {
        sinCambios++;
        continue;
      }

      /*
        FOTO

        La foto pertenece a la persona.

        Si el usuario de esa categoría ya tiene foto,
        la conservamos.

        Si hay una nueva foto de Drive,
        la subimos/reemplazamos en Cloudinary.
      */

      let foto =
        usuarioExistente?.foto ||
        FOTO_INCOGNITO;

      let fotoPublicId =
        usuarioExistente?.fotoPublicId ||
        "";

      if (fotoDriveUrl) {
        const fotoDriveId = extraerDriveId(
          fotoDriveUrl
        );

        if (!fotoDriveId) {
          console.warn(
            `No se pudo extraer el ID de Drive del DNI ${dni}:`,
            fotoDriveUrl
          );
        } else {
          try {
            console.log(
              `Descargando foto del DNI ${dni} desde Drive. ID: ${fotoDriveId}`
            );

            const imagenBuffer =
              await descargarArchivoDrive(
                fotoDriveId
              );

            console.log(
              `Foto descargada correctamente para DNI ${dni}. Subiendo a Cloudinary...`
            );

            const resultadoCloudinary =
              await subirBufferACloudinary(
                imagenBuffer,
                dni
              );

            foto =
              resultadoCloudinary.secure_url;

            fotoPublicId =
              resultadoCloudinary.public_id;

            console.log(
              `Foto subida correctamente a Cloudinary para DNI ${dni}:`,
              foto
            );
          } catch (errorFoto) {
            console.error(
              `Error procesando foto del DNI ${dni}:`,
              errorFoto.message
            );

            /*
              Si ya tenía foto, conserva la anterior.
              Si no tenía, queda incógnito.
            */
            foto =
              usuarioExistente?.foto ||
              FOTO_INCOGNITO;

            fotoPublicId =
              usuarioExistente?.fotoPublicId ||
              "";
          }
        }
      }

      /*
        ACTUALIZAMOS POR:

        DNI + CATEGORÍA

        Si existe:
        UPDATE

        Si no existe:
        CREATE
      */
      await RankingUsuario.findOneAndUpdate(
        {
          dni,
          categoria,
        },

        {
          ...datosNuevos,
          foto,
          fotoPublicId,
        },

        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
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
    erroresDuplicados,

    errores,
  };
}

/*
  Endpoint manual.

  También es utilizado por Postman
  y puede ser utilizado por el cron.
*/
export async function importarRankingDesdeSheets(
  req,
  res
) {
  try {
    const resultado =
      await ejecutarImportacionRanking();

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({
      mensaje:
        "Error importando ranking desde Google Sheets",
      error: error.message,
    });
  }
}