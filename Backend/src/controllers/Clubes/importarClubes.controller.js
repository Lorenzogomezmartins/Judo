import Club from "../../models/club.js";

import {
  obtenerFilasClubes,
  descargarArchivoDrive,
  extraerDriveId,
} from "../../config/google.js";

import {
  subirBufferACloudinary,
} from "../../config/cloudinary.js";

/*
========================================
NORMALIZADORES
========================================
*/

function normalizarTexto(valor = "") {
  return String(valor ?? "").trim();
}

function normalizarNumero(valor = "") {
  const texto = String(valor ?? "")
    .replace(",", ".")
    .trim();

  if (!texto) {
    return 0;
  }

  const numero = Number(texto);

  return Number.isNaN(numero)
    ? 0
    : numero;
}

/*
========================================
RESULTADO DE COMPETENCIA
========================================

inicio:

1  = B:E
5  = F:I
9  = J:M
13 = N:Q
17 = R:U
*/

function obtenerResultado(
  fila,
  inicio
) {
  return {
    oro: normalizarNumero(
      fila[inicio]
    ),

    plata: normalizarNumero(
      fila[inicio + 1]
    ),

    bronce: normalizarNumero(
      fila[inicio + 2]
    ),

    quinto: normalizarNumero(
      fila[inicio + 3]
    ),
  };
}

/*
========================================
IMPORTAR CLUBES
========================================
*/

export async function ejecutarImportacionClubes() {
  const filas =
    await obtenerFilasClubes();

  if (!filas.length) {
    throw new Error(
      "La planilla de clubes está vacía."
    );
  }

  /*
    FILA 1:
    nombres de competencias

    FILA 2:
    Oro / Plata / Bronce / Quinto

    FILA 3 EN ADELANTE:
    clubes
  */

  const filasDatos =
    filas.slice(2);

  let creados = 0;
  let actualizados = 0;
  let sinCambios = 0;
  let omitidos = 0;

  const errores = [];

  /*
  Evita importar dos veces
  la misma institución dentro
  de la misma ejecución.
  */

  const institucionesProcesadas =
    new Set();

  for (
    let i = 0;
    i < filasDatos.length;
    i++
  ) {
    const fila = filasDatos[i];

    /*
      Google Sheets empieza la información
      real en la fila 3.
    */

    const numeroFilaReal = i + 3;

    try {
      /*
====================================
COLUMNAS DEL EXCEL
====================================

A     = 0  Institución

B:E   = 1-4   Abierto de la Ciudad
F:I   = 5-8   Juegos Porteños
J:M   = 9-12  Copa Doblas
N:Q   = 13-16 Juegos UFeDeM
R:U   = 17-20 Torneo Metropolitano
V:Y   = 21-24 Medallero Global

Z     = 25 Logo
AA    = 26 Ubicación
AB    = 27 Teléfono
AC    = 28 Email
AD    = 29 Facebook
AE    = 30 Instagram
AF    = 31 Ubicación Maps
AG    = 32 Ranking
*/

      const nombre =
        normalizarTexto(
          fila[0]
        );

      /*
      ------------------------------------
      FILAS VACÍAS
      ------------------------------------
      */

      if (!nombre) {
        omitidos++;
        continue;
      }

      /*
      ------------------------------------
      DUPLICADOS DENTRO DEL EXCEL
      ------------------------------------
      */

      const nombreNormalizado =
        nombre.toLowerCase();

      if (
        institucionesProcesadas.has(
          nombreNormalizado
        )
      ) {
        errores.push({
          fila: numeroFilaReal,
          institucion: nombre,
          error:
            "Institución repetida dentro de la planilla.",
        });

        continue;
      }

      institucionesProcesadas.add(
        nombreNormalizado
      );

      /*
      ------------------------------------
      COMPETENCIAS
      ------------------------------------
      */

      const abiertoCiudad2026 =
  obtenerResultado(fila, 1);

const juegosPortenos2026 =
  obtenerResultado(fila, 5);

const copaDoblas2026 =
  obtenerResultado(fila, 9);

const juegosUFedem2026 =
  obtenerResultado(fila, 13);

const torneoMetropolitano2026 =
  obtenerResultado(fila, 17);

const medalleroGlobal =
  obtenerResultado(fila, 21);

      /*
      ------------------------------------
      INFORMACIÓN DEL CLUB
      ------------------------------------
      */

      const logoDriveUrl =
  normalizarTexto(fila[25]);

const ubicacion =
  normalizarTexto(fila[26]);

const telefono =
  normalizarTexto(fila[27]);

const email =
  normalizarTexto(fila[28]);

const facebook =
  normalizarTexto(fila[29]);

const instagram =
  normalizarTexto(fila[30]);

const ubicacionMaps =
  normalizarTexto(fila[31]);

      /*
      ------------------------------------
      RANKING
      ------------------------------------
      */

      const ranking =
  normalizarNumero(
    fila[32]
  );

      /*
      ------------------------------------
      BUSCAR CLUB
      ------------------------------------
      */

      const clubExistente =
        await Club.findOne({
          nombre: {
            $regex:
              `^${nombre.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}$`,
            $options: "i",
          },
        });

      /*
      ------------------------------------
      DATOS NUEVOS
      ------------------------------------
      */

      const datosNuevos = {
        nombre,

        abiertoCiudad2026,

        juegosPortenos2026,

        copaDoblas2026,

        juegosUFedem2026,

        torneoMetropolitano2026,

        medalleroGlobal,

        ubicacion,

        telefono,

        email,

        facebook,

        instagram,

        ubicacionMaps,

        ranking,

        filaGoogleSheet:
          numeroFilaReal,

        datosOriginales: {
          institucion: nombre,

          logoDriveUrl,

          ubicacion,

          telefono,

          email,

          facebook,

          instagram,

          ubicacionMaps,
        },
      };

      /*
      ------------------------------------
      FOTO
      ------------------------------------

      Si no viene logo nuevo:
      conservamos el anterior.

      Si viene logo:
      intentamos descargarlo de Drive
      y subirlo a Cloudinary.
      */

      let logo =
        clubExistente?.logo ||
        "";

      let logoPublicId =
        clubExistente?.logoPublicId ||
        "";

      if (logoDriveUrl) {
        /*
          Si ya es Cloudinary,
          no hace falta descargarlo.
        */

        if (
          logoDriveUrl.includes(
            "cloudinary.com"
          )
        ) {
          logo =
            logoDriveUrl;
        } else {
          const driveId =
            extraerDriveId(
              logoDriveUrl
            );

          if (driveId) {
            try {
              console.log(
                `Descargando logo de ${nombre} desde Google Drive...`
              );

              const buffer =
                await descargarArchivoDrive(
                  driveId
                );

              console.log(
                `Subiendo logo de ${nombre} a Cloudinary...`
              );

              const resultado =
                await subirBufferACloudinary(
                  buffer,

                  /*
                    Usamos el ID del club
                    si existe.

                    Para clubes nuevos usamos
                    un nombre temporal.
                  */
                  clubExistente?._id
                    ? `club_${clubExistente._id}`
                    : `club_${nombreNormalizado
                        .replace(
                          /[^a-z0-9]+/g,
                          "_"
                        )
                        .replace(
                          /^_+|_+$/g,
                          ""
                        )}`,

                  "fmj/clubes"
                );

              logo =
                resultado.secure_url;

              logoPublicId =
                resultado.public_id;
            } catch (errorFoto) {
              console.error(
                `Error procesando logo de ${nombre}:`,
                errorFoto.message
              );

              /*
                Si falla la foto nueva,
                mantenemos la anterior.
              */
            }
          } else {
            /*
              Si no es un link de Drive válido,
              guardamos el valor igualmente.

              Así no perdemos el dato del Excel.
            */

            logo =
              logoDriveUrl;
          }
        }
      }

      /*
      ------------------------------------
      DATOS COMPLETOS PARA MONGODB
      ------------------------------------
      */

      const datosGuardar = {
        ...datosNuevos,

        logo,

        logoPublicId,
      };

      /*
      ------------------------------------
      COMPARACIÓN
      ------------------------------------
      */

      if (clubExistente) {
        const datosActuales =
          clubExistente.toObject();

        const actual =
          JSON.stringify({
            nombre:
              datosActuales.nombre,

            abiertoCiudad2026:
              datosActuales.abiertoCiudad2026,

            juegosPortenos2026:
              datosActuales.juegosPortenos2026,

            copaDoblas2026:
              datosActuales.copaDoblas2026,

              juegosUFedem2026:
  datosActuales.juegosUFedem2026,

            torneoMetropolitano2026:
              datosActuales.torneoMetropolitano2026,

            medalleroGlobal:
              datosActuales.medalleroGlobal,

            logo:
              datosActuales.logo,

            ubicacion:
              datosActuales.ubicacion,

            telefono:
              datosActuales.telefono,

            email:
              datosActuales.email,

            facebook:
              datosActuales.facebook,

            instagram:
              datosActuales.instagram,

            ubicacionMaps:
              datosActuales.ubicacionMaps,

            ranking:
              datosActuales.ranking,
          });

        const nuevo =
          JSON.stringify({
            nombre:
              datosGuardar.nombre,

            abiertoCiudad2026:
              datosGuardar.abiertoCiudad2026,

            juegosPortenos2026:
              datosGuardar.juegosPortenos2026,

            copaDoblas2026:
              datosGuardar.copaDoblas2026,

              juegosUFedem2026:
  datosGuardar.juegosUFedem2026,

            torneoMetropolitano2026:
              datosGuardar.torneoMetropolitano2026,

            medalleroGlobal:
              datosGuardar.medalleroGlobal,

            logo:
              datosGuardar.logo,

            ubicacion:
              datosGuardar.ubicacion,

            telefono:
              datosGuardar.telefono,

            email:
              datosGuardar.email,

            facebook:
              datosGuardar.facebook,

            instagram:
              datosGuardar.instagram,

            ubicacionMaps:
              datosGuardar.ubicacionMaps,

            ranking:
              datosGuardar.ranking,
          });

        if (actual === nuevo) {
          sinCambios++;
          continue;
        }
      }

      /*
      ------------------------------------
      UPSERT
      ------------------------------------
      */

      await Club.findOneAndUpdate(
        {
          nombre: {
            $regex:
              `^${nombre.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}$`,
            $options: "i",
          },
        },

        datosGuardar,

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
      console.error(
        `Error procesando fila ${numeroFilaReal}:`,
        error
      );

      errores.push({
        fila: numeroFilaReal,
        error: error.message,
      });
    }
  }

  return {
    mensaje:
      "Importación de clubes finalizada.",

    creados,

    actualizados,

    sinCambios,

    omitidos,

    totalProcesados:
      filasDatos.length,

    errores,
  };
}

/*
========================================
ENDPOINT MANUAL
========================================
*/

export async function importarClubesDesdeSheets(
  req,
  res
) {
  try {
    const resultado =
      await ejecutarImportacionClubes();

    return res.status(200).json(
      resultado
    );
  } catch (error) {
    console.error(
      "Error importando clubes:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error importando clubes desde Google Sheets.",

      error:
        error.message,
    });
  }
}