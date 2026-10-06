import Club from "../../models/club.js";

import multer from "multer";

import {
  subirBufferACloudinary,
} from "../../config/cloudinary.js";

/*
========================================
MULTER
========================================
*/

const storage =
  multer.memoryStorage();

export const uploadClubLogo =
  multer({
    storage,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  }).single("logo");

/*
========================================
OBTENER TODOS LOS CLUBES
========================================
*/

export async function obtenerClubes(
  req,
  res
) {
  try {
    const clubes =
      await Club.find({})
        .sort({
          ranking: 1,
          nombre: 1,
        })
        .lean();

    return res.json(
      clubes
    );
  } catch (error) {
    console.error(
      "Error obteniendo clubes:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error al obtener clubes.",

      error:
        error.message,
    });
  }
}

/*
========================================
OBTENER CLUB POR ID
========================================
*/

export async function obtenerClubPorId(
  req,
  res
) {
  try {
    const club =
      await Club.findById(
        req.params.id
      );

    if (!club) {
      return res.status(404).json({
        mensaje:
          "Club no encontrado.",
      });
    }

    return res.json(
      club
    );
  } catch (error) {
    console.error(
      "Error obteniendo club:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error al obtener el club.",

      error:
        error.message,
    });
  }
}

/*
========================================
CREAR CLUB
========================================
*/

export async function crearClub(
  req,
  res
) {
  try {
    const {
      nombre,
      telefono,
      direccion,
      ubicacion,
      sitioWeb,
      email,
      facebook,
      instagram,
      ubicacionMaps,
      ranking,
    } = req.body;

    /*
    ------------------------------------
    VALIDACIÓN
    ------------------------------------
    */

    if (
      !nombre ||
      !nombre.trim()
    ) {
      return res.status(400).json({
        mensaje:
          "El nombre del club es obligatorio.",
      });
    }

    /*
    ------------------------------------
    BUSCAR DUPLICADO
    ------------------------------------
    */

    const existe =
      await Club.findOne({
        nombre: {
          $regex:
            `^${nombre
              .trim()
              .replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}$`,
          $options: "i",
        },
      });

    if (existe) {
      return res.status(400).json({
        mensaje:
          "Ya existe un club con ese nombre.",
      });
    }

    /*
    ------------------------------------
    CREAR
    ------------------------------------
    */

    const club =
      new Club({
        nombre:
          nombre.trim(),

        telefono:
          telefono?.trim() ||
          "",

        /*
          Soportamos ambos nombres:
          direccion
          y ubicacion

          La planilla usa "ubicacion".
        */

        ubicacion:
          ubicacion?.trim() ||
          direccion?.trim() ||
          "",

        sitioWeb:
          sitioWeb?.trim() ||
          "",

        email:
          email?.trim() ||
          "",

        facebook:
          facebook?.trim() ||
          "",

        instagram:
          instagram?.trim() ||
          "",

        ubicacionMaps:
          ubicacionMaps?.trim() ||
          "",

        ranking:
          normalizarRanking(
            ranking
          ),
      });

    /*
    ------------------------------------
    LOGO
    ------------------------------------
    */

    if (req.file) {
      try {
        const resultado =
          await subirBufferACloudinary(
            req.file.buffer,

            `club_${club._id}`,

            "fmj/clubes"
          );

        club.logo =
          resultado.secure_url;

        club.logoPublicId =
          resultado.public_id;
      } catch (errorFoto) {
        console.error(
          "Error subiendo logo:",
          errorFoto
        );
      }
    }

    await club.save();

    return res.status(201).json({
      mensaje:
        "Club creado correctamente.",

      club,
    });
  } catch (error) {
    console.error(
      "Error creando club:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error al crear el club.",

      error:
        error.message,
    });
  }
}

/*
========================================
ACTUALIZAR CLUB
========================================
*/

export async function actualizarClub(
  req,
  res
) {
  try {
    const club =
      await Club.findById(
        req.params.id
      );

    if (!club) {
      return res.status(404).json({
        mensaje:
          "Club no encontrado.",
      });
    }

    const {
      nombre,
      telefono,
      direccion,
      ubicacion,
      sitioWeb,
      email,
      facebook,
      instagram,
      ubicacionMaps,
      ranking,
    } = req.body;

    /*
    ------------------------------------
    NOMBRE
    ------------------------------------
    */

    if (
      nombre &&
      nombre.trim()
    ) {
      const otroClub =
        await Club.findOne({
          _id: {
            $ne: club._id,
          },

          nombre: {
            $regex:
              `^${nombre
                .trim()
                .replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )}$`,

            $options: "i",
          },
        });

      if (otroClub) {
        return res.status(400).json({
          mensaje:
            "Ya existe otro club con ese nombre.",
        });
      }

      club.nombre =
        nombre.trim();
    }

    /*
    ------------------------------------
    DATOS
    ------------------------------------
    */

    if (
      telefono !== undefined
    ) {
      club.telefono =
        String(
          telefono
        ).trim();
    }

    if (
      ubicacion !== undefined ||
      direccion !== undefined
    ) {
      club.ubicacion =
        String(
          ubicacion ??
            direccion ??
            ""
        ).trim();
    }

    if (
      sitioWeb !== undefined
    ) {
      club.sitioWeb =
        String(
          sitioWeb
        ).trim();
    }

    if (
      email !== undefined
    ) {
      club.email =
        String(
          email
        ).trim();
    }

    if (
      facebook !== undefined
    ) {
      club.facebook =
        String(
          facebook
        ).trim();
    }

    if (
      instagram !== undefined
    ) {
      club.instagram =
        String(
          instagram
        ).trim();
    }

    if (
      ubicacionMaps !==
      undefined
    ) {
      club.ubicacionMaps =
        String(
          ubicacionMaps
        ).trim();
    }

    if (
      ranking !== undefined
    ) {
      club.ranking =
        normalizarRanking(
          ranking
        );
    }

    /*
    ------------------------------------
    NUEVO LOGO
    ------------------------------------
    */

    if (req.file) {
      try {
        const resultado =
          await subirBufferACloudinary(
            req.file.buffer,

            `club_${club._id}`,

            "fmj/clubes"
          );

        club.logo =
          resultado.secure_url;

        club.logoPublicId =
          resultado.public_id;
      } catch (errorFoto) {
        console.error(
          "Error subiendo nuevo logo:",
          errorFoto
        );
      }
    }

    await club.save();

    return res.json({
      mensaje:
        "Club actualizado correctamente.",

      club,
    });
  } catch (error) {
    console.error(
      "Error actualizando club:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error al actualizar el club.",

      error:
        error.message,
    });
  }
}

/*
========================================
ELIMINAR CLUB
========================================
*/

export async function eliminarClub(
  req,
  res
) {
  try {
    const club =
      await Club.findById(
        req.params.id
      );

    if (!club) {
      return res.status(404).json({
        mensaje:
          "Club no encontrado.",
      });
    }

    await Club.findByIdAndDelete(
      req.params.id
    );

    return res.json({
      mensaje:
        "Club eliminado correctamente.",
    });
  } catch (error) {
    console.error(
      "Error eliminando club:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error al eliminar el club.",

      error:
        error.message,
    });
  }
}

/*
========================================
NORMALIZAR RANKING
========================================
*/

function normalizarRanking(
  valor
) {
  const numero =
    Number(
      String(
        valor ?? ""
      )
        .replace(",", ".")
        .trim()
    );

  return Number.isNaN(
    numero
  )
    ? 0
    : numero;
}