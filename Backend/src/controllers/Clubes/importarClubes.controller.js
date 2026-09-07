import Club from "../../models/club.js";

import {
  obtenerFilasClubes,
  descargarArchivoDrive,
  extraerDriveId,
} from "../../config/google.js";

import { subirBufferACloudinary } from "../../config/cloudinary.js";

function normalizarTexto(valor = "") {
  return String(valor ?? "").trim();
}

function normalizarNumero(valor = "") {
  const limpio = String(valor ?? "")
    .replace(",", ".")
    .trim();

  const numero = Number(limpio);

  return Number.isNaN(numero) ? 0 : numero;
}

function normalizarUrl(valor = "") {
  const texto = normalizarTexto(valor);

  if (!texto) return "";

  return texto;
}

function normalizarLogoDrive(valor = "") {
  const logo = normalizarTexto(valor);

  if (!logo) return "";

  return logo;
}

function normalizarNombreClub(valor = "") {
  return normalizarTexto(valor);
}

function hayCambios(clubExistente, datosNuevos) {
  if (!clubExistente) return true;

  return (
    clubExistente.nombre !== datosNuevos.nombre ||

    clubExistente.ubicacion !== datosNuevos.ubicacion ||

    clubExistente.telefono !== datosNuevos.telefono ||

    clubExistente.email !== datosNuevos.email ||

    clubExistente.facebook !== datosNuevos.facebook ||

    clubExistente.instagram !== datosNuevos.instagram ||

    Number(clubExistente.puntajeTotal || 0) !==
      Number(datosNuevos.puntajeTotal || 0) ||

    Number(clubExistente.ranking || 0) !==
      Number(datosNuevos.ranking || 0) ||

    clubExistente.datosOriginales?.logoDriveUrl !==
      datosNuevos.datosOriginales?.logoDriveUrl
  );
}


/*
=========================================================
IMPORTACIÓN DE CLUBES
=========================================================

Por ahora usamos estas columnas:

A = Nombre
B = Logo
C = Ubicación
D = Teléfono
E = Email
F = Facebook
G = Instagram
H = Puntaje total
I = Ranking

Cuando tengamos el Excel definitivo,
si las columnas son diferentes solamente
cambiamos estas posiciones.
=========================================================
*/

export async function ejecutarImportacionClubes() {
  const filas = await obtenerFilasClubes();

  if (!filas.length) {
    throw new Error("La planilla de clubes está vacía");
  }

  /*
    Igual que con el ranking de judokas,
    asumimos que las primeras filas contienen
    encabezados.

    Esto después lo podemos ajustar al Excel real.
  */
  const filasDatos = filas.slice(1);

  let creados = 0;
  let actualizados = 0;
  let sinCambios = 0;
  let omitidosSinNombre = 0;
  let erroresDuplicados = 0;

  const errores = [];

  const clubesProcesados = new Set();

  for (let i = 0; i < filasDatos.length; i++) {
    const fila = filasDatos[i];

    const numeroFilaReal = i + 2;

    try {
      /*
      =========================================
      DATOS DEL CLUB
      =========================================
      */

      const nombre = normalizarNombreClub(fila[0]);

      const logoDriveUrl =
        normalizarLogoDrive(fila[1]);

      const ubicacion =
        normalizarTexto(fila[2]);

      const telefono =
        normalizarTexto(fila[3]);

      const email =
        normalizarTexto(fila[4]);

      const facebook =
        normalizarUrl(fila[5]);

      const instagram =
        normalizarUrl(fila[6]);

      const puntajeTotal =
        normalizarNumero(fila[7]);

      const ranking =
        normalizarNumero(fila[8]);


      /*
      =========================================
      NOMBRE OBLIGATORIO
      =========================================
      */

      if (!nombre) {
        omitidosSinNombre++;

        errores.push({
          fila: numeroFilaReal,
          error: "No se importó porque no tiene nombre de institución",
        });

        continue;
      }


      /*
      =========================================
      CONTROL DE DUPLICADOS
      =========================================

      El nombre identifica al club.
      =========================================
      */

      const claveClub = nombre.toLowerCase();

      if (clubesProcesados.has(claveClub)) {
        erroresDuplicados++;

        errores.push({
          fila: numeroFilaReal,
          nombre,
          error: "Institución repetida dentro de la planilla",
        });

        continue;
      }

      clubesProcesados.add(claveClub);


      /*
      =========================================
      DATOS NUEVOS
      =========================================
      */

      const datosNuevos = {
        nombre,

        ubicacion,
        telefono,
        email,
        facebook,
        instagram,

        puntajeTotal,
        ranking,

        filaGoogleSheet: numeroFilaReal,

        datosOriginales: {
          nombre,
          logoDriveUrl,

          ubicacion,
          telefono,
          email,

          facebook,
          instagram,

          puntajeTotal,
          ranking,
        },
      };


      /*
      =========================================
      BUSCAR CLUB EXISTENTE
      =========================================
      */

      const clubExistente =
        await Club.findOne({
          nombre,
        });


      /*
      =========================================
      VERIFICAR CAMBIOS
      =========================================
      */

      const cambioDatos =
        hayCambios(
          clubExistente,
          datosNuevos
        );


      if (
        clubExistente &&
        !cambioDatos
      ) {
        sinCambios++;
        continue;
      }


      /*
      =========================================
      LOGO
      =========================================

      Si hay logo en Drive:
      - lo descargamos
      - lo subimos a Cloudinary
      - guardamos URL + publicId

      Si no hay logo:
      - conservamos el anterior.
      =========================================
      */

      let logo =
        clubExistente?.logo ||
        "";

      let logoPublicId =
        clubExistente?.logoPublicId ||
        "";


      if (logoDriveUrl) {
        const logoDriveId =
          extraerDriveId(
            logoDriveUrl
          );

        if (!logoDriveId) {
          console.warn(
            `No se pudo extraer el ID de Drive del club "${nombre}"`
          );
        } else {
          try {
            console.log(
              `Descargando logo de "${nombre}" desde Drive...`
            );

            const logoBuffer =
              await descargarArchivoDrive(
                logoDriveId
              );


            console.log(
              `Logo descargado. Subiendo "${nombre}" a Cloudinary...`
            );


            const resultadoCloudinary =
              await subirBufferACloudinary(
                logoBuffer,
                `club_${nombre
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/gi, "_")}`,
                "fmj/clubes"
              );


            logo =
              resultadoCloudinary.secure_url;

            logoPublicId =
              resultadoCloudinary.public_id;


            console.log(
              `Logo de "${nombre}" subido correctamente`
            );

          } catch (errorLogo) {
            console.error(
              `Error procesando logo de "${nombre}":`,
              errorLogo.message
            );

            /*
              Si ya tenía logo,
              conservamos el anterior.
            */
            logo =
              clubExistente?.logo ||
              "";

            logoPublicId =
              clubExistente?.logoPublicId ||
              "";
          }
        }
      }


      /*
      =========================================
      GUARDAR
      =========================================
      */

      await Club.findOneAndUpdate(
        {
          nombre,
        },

        {
          ...datosNuevos,

          logo,
          logoPublicId,
        },

        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );


      if (clubExistente) {
        actualizados++;
      } else {
        creados++;
      }

    } catch (error) {
      errores.push({
        fila: numeroFilaReal,
        error: error.message,
      });
    }
  }


  return {
    mensaje:
      "Importación de clubes finalizada",

    creados,
    actualizados,
    sinCambios,

    omitidosSinNombre,
    erroresDuplicados,

    errores,
  };
}


/*
=========================================================
ENDPOINT MANUAL
=========================================================
*/

export async function importarClubesDesdeSheets(
  req,
  res
) {
  try {
    const resultado =
      await ejecutarImportacionClubes();

    return res
      .status(200)
      .json(resultado);

  } catch (error) {

    return res
      .status(500)
      .json({
        mensaje:
          "Error importando clubes desde Google Sheets",

        error: error.message,
      });
  }
}