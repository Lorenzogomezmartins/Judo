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

/*
  =====================================================
  COLUMNAS POR NOMBRE DE ENCABEZADO
  =====================================================

  La planilla tiene dos filas de encabezado:

  Fila 1:  (vacío) ... Abierto de la Ciudad 2026 | (vacío) | Juegos Porteños 2026 ... Puntaje Total | Foto | Ranking
  Fila 2:  id | last | first | club | category | Unificar | pos | Puntaje | pos | Puntaje ...

  Se combinan las dos filas, así cada columna queda
  identificada por un nombre, por ejemplo:

    "id"
    "ranking"
    "puntaje total"
    "abierto de la ciudad 2026|pos"
    "juegos porteos 2026|puntaje"   (en minúscula)

  De esta forma el orden de las columnas en la planilla
  deja de importar.
*/

function normalizarEncabezado(valor = "") {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function construirMapaColumnas(filaGrupos = [], filaCampos = []) {
  const mapa = {};
  const total = Math.max(filaGrupos.length, filaCampos.length);

  let grupoActual = "";

  for (let i = 0; i < total; i++) {
    const grupo = normalizarEncabezado(filaGrupos[i]);
    const campo = normalizarEncabezado(filaCampos[i]);

    let clave = "";

    if (grupo && campo) {
      // Ej: "Abierto de la Ciudad 2026" + "pos"
      grupoActual = grupo;
      clave = `${grupo}|${campo}`;
    } else if (grupo && !campo) {
      // Columna simple: "Puntaje Total", "Foto", "Ranking"
      grupoActual = "";
      clave = grupo;
    } else if (!grupo && campo) {
      // Segunda columna del grupo ("Puntaje") o columna simple ("id")
      clave = grupoActual ? `${grupoActual}|${campo}` : campo;
    }

    if (clave && mapa[clave] === undefined) {
      mapa[clave] = i;
    }
  }

  return mapa;
}

const ALIAS_COLUMNAS = {
  dni: ["id", "dni"],
  apellido: ["last", "apellido"],
  nombre: ["first", "nombre"],
  institucion: ["club", "institucion"],
  categoria: ["category", "categoria"],
  clave: ["unificar", "clave"],

  abiertoPosicion: ["abierto de la ciudad 2026|pos"],
  abiertoPuntaje: ["abierto de la ciudad 2026|puntaje"],

  juegosPosicion: ["juegos porteños 2026|pos"],
juegosPuntaje: ["juegos porteños 2026|puntaje"],

juegosUFedemPosicion: ["juegos ufedem 2026|pos"],
juegosUFedemPuntaje: ["juegos ufedem 2026|puntaje"],

  copaDoblasPosicion: ["copa doblas 2026|pos"],
  copaDoblasPuntaje: ["copa doblas 2026|puntaje"],

  metropolitanoPosicion: ["torneo metropolitano 2026|pos"],
  metropolitanoPuntaje: ["torneo metropolitano 2026|puntaje"],

  puntajeTotal: ["puntaje total"],
  foto: ["foto"],
  ranking: ["ranking"],

  // Opcionales: si no están en la planilla, quedan vacíos.
  peso: ["peso"],
  sexo: ["sexo"],
};

const COLUMNAS_OBLIGATORIAS = [
  "dni",
  "categoria",
  "puntajeTotal",
  "ranking",
];

function resolverColumnas(filas) {
  if (filas.length < 2) {
    throw new Error("La planilla no tiene las dos filas de encabezado");
  }

  const mapa = construirMapaColumnas(filas[0], filas[1]);

  const columnas = {};

  for (const [campo, alias] of Object.entries(ALIAS_COLUMNAS)) {
    // Los alias se normalizan igual que los encabezados de la planilla.
    const encontrado = alias
      .map((nombre) => mapa[normalizarEncabezado(nombre)])
      .find((indice) => indice !== undefined);

    columnas[campo] = encontrado === undefined ? -1 : encontrado;
  }

  const faltantes = COLUMNAS_OBLIGATORIAS.filter(
    (campo) => columnas[campo] === -1
  );

  if (faltantes.length) {
    throw new Error(
      `No se encontraron estas columnas en la planilla: ${faltantes.join(
        ", "
      )}. Encabezados detectados: ${Object.keys(mapa).join(" / ")}`
    );
  }

  return columnas;
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

    usuarioExistente.juegosPortenos2026?.posicion !==
      datosNuevos.juegosPortenos2026.posicion ||

    Number(usuarioExistente.juegosPortenos2026?.puntaje || 0) !==
      Number(datosNuevos.juegosPortenos2026.puntaje || 0) ||

      usuarioExistente.juegosUFedem2026?.posicion !==
  datosNuevos.juegosUFedem2026.posicion ||

Number(usuarioExistente.juegosUFedem2026?.puntaje || 0) !==
  Number(datosNuevos.juegosUFedem2026.puntaje || 0) ||

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

  El ranking y el puntaje total se guardan TAL CUAL
  figuran en la planilla. No se calcula nada.
*/

export async function ejecutarImportacionRanking() {
  const filas = await obtenerFilasInscripciones();

  if (!filas.length) {
    throw new Error("La planilla está vacía");
  }

  // Ubicamos cada columna por el nombre de su encabezado.
  const columnas = resolverColumnas(filas);

  console.log("COLUMNAS DETECTADAS EN LA PLANILLA:", columnas);

  // Los datos comienzan desde la fila 3.
  const filasDatos = filas.slice(2);

  let creadas = 0;
  let actualizadas = 0;
  let sinCambios = 0;
  let omitidasSinDni = 0;
  let erroresDuplicados = 0;

  const errores = [];

  const registrosProcesados = new Set();

  for (let i = 0; i < filasDatos.length; i++) {
    const fila = filasDatos[i];
    const numeroFilaReal = i + 3;

    // Devuelve el valor de una columna, o "" si no existe en la planilla.
    const celda = (campo) =>
      columnas[campo] >= 0 ? fila[columnas[campo]] : "";

    try {
      const dni = normalizarDni(celda("dni"));

      const apellido = normalizarTexto(celda("apellido"));
      const nombre = normalizarTexto(celda("nombre"));
      const institucion = normalizarTexto(celda("institucion"));
      const categoria = normalizarTexto(celda("categoria"));
      const clave = normalizarTexto(celda("clave"));

      const abiertoPosicion = normalizarTexto(celda("abiertoPosicion"));
      const abiertoPuntaje = normalizarNumero(celda("abiertoPuntaje"));

      const juegosPosicion = normalizarTexto(celda("juegosPosicion"));
const juegosPuntaje = normalizarNumero(celda("juegosPuntaje"));

const juegosUFedemPosicion = normalizarTexto(
  celda("juegosUFedemPosicion")
);
const juegosUFedemPuntaje = normalizarNumero(
  celda("juegosUFedemPuntaje")
);

      const copaDoblasPosicion = normalizarTexto(celda("copaDoblasPosicion"));
      const copaDoblasPuntaje = normalizarNumero(celda("copaDoblasPuntaje"));

      const metropolitanoPosicion = normalizarTexto(
        celda("metropolitanoPosicion")
      );
      const metropolitanoPuntaje = normalizarNumero(
        celda("metropolitanoPuntaje")
      );

      const puntajeTotal = normalizarNumero(celda("puntajeTotal"));

      const fotoDriveUrl = normalizarFotoDrive(celda("foto"));

      const ranking = normalizarNumero(celda("ranking"));

      const peso = normalizarNumero(celda("peso"));
      const sexo = normalizarSexo(celda("sexo"));

      if (!dni) {
        omitidasSinDni++;

        errores.push({
          fila: numeroFilaReal,
          error: "No se importó porque no tiene DNI",
        });

        continue;
      }

      if (!categoria) {
        errores.push({
          fila: numeroFilaReal,
          dni,
          error: "No se importó porque no tiene categoría",
        });

        continue;
      }

      const claveRegistro = `${dni}|${categoria.toLowerCase()}`;

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

        juegosPortenos2026: {
          posicion: juegosPosicion,
          puntaje: juegosPuntaje,
        },

        juegosUFedem2026: {
  posicion: juegosUFedemPosicion,
  puntaje: juegosUFedemPuntaje,
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

          juegosPosicion,
juegosPuntaje,

juegosUFedemPosicion,
juegosUFedemPuntaje,

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

      const cambioDatos = hayCambios(usuarioExistente, datosNuevos);

      if (usuarioExistente && !cambioDatos) {
        sinCambios++;
        continue;
      }

      /*
        FOTO

        Si ya tiene foto, se conserva.
        Si hay una nueva foto de Drive, se sube a Cloudinary.
      */
      let foto = usuarioExistente?.foto || FOTO_INCOGNITO;

      let fotoPublicId = usuarioExistente?.fotoPublicId || "";

      if (fotoDriveUrl) {
        const fotoDriveId = extraerDriveId(fotoDriveUrl);

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

            const imagenBuffer = await descargarArchivoDrive(fotoDriveId);

            console.log(
              `Foto descargada correctamente para DNI ${dni}. Subiendo a Cloudinary...`
            );

            const resultadoCloudinary = await subirBufferACloudinary(
              imagenBuffer,
              dni
            );

            foto = resultadoCloudinary.secure_url;
            fotoPublicId = resultadoCloudinary.public_id;

            console.log(
              `Foto subida correctamente a Cloudinary para DNI ${dni}:`,
              foto
            );
          } catch (errorFoto) {
            console.error(
              `Error procesando foto del DNI ${dni}:`,
              errorFoto.message
            );

            foto = usuarioExistente?.foto || FOTO_INCOGNITO;
            fotoPublicId = usuarioExistente?.fotoPublicId || "";
          }
        }
      }

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