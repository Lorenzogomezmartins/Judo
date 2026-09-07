import Club from "../../models/club.js";

import {
  subirBufferACloudinary,
} from "../../config/cloudinary.js";


function normalizarTexto(valor = "") {
  return String(valor ?? "").trim();
}


function normalizarNumero(valor = "") {
  const numero = Number(
    String(valor ?? "")
      .replace(",", ".")
      .trim()
  );

  return Number.isNaN(numero)
    ? 0
    : numero;
}


/*
=========================================================
GET - LISTAR CLUBES
=========================================================
*/

export async function obtenerClubes(req, res) {
  try {

    const clubes =
      await Club.find()
        .sort({
          puntajeTotal: -1,
          nombre: 1,
        });

    return res.json(clubes);

  } catch (error) {

    console.error(
      "Error obteniendo clubes:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error obteniendo clubes",
      error: error.message,
    });
  }
}


/*
=========================================================
GET - OBTENER CLUB POR ID
=========================================================
*/

export async function obtenerClubPorId(req, res) {
  try {

    const club =
      await Club.findById(
        req.params.id
      );

    if (!club) {
      return res.status(404).json({
        mensaje: "Club no encontrado",
      });
    }

    return res.json(club);

  } catch (error) {

    console.error(
      "Error obteniendo club:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error obteniendo club",
      error: error.message,
    });
  }
}


/*
=========================================================
POST - AGREGAR CLUB
=========================================================
*/

export async function crearClub(req, res) {
  try {

    const nombre =
      normalizarTexto(
        req.body.nombre
      );

    if (!nombre) {
      return res.status(400).json({
        mensaje:
          "El nombre de la institución es obligatorio",
      });
    }


    const clubExistente =
      await Club.findOne({
        nombre,
      });


    if (clubExistente) {
      return res.status(409).json({
        mensaje:
          "Ya existe una institución con ese nombre",
      });
    }


    let logo = "";
    let logoPublicId = "";


    /*
      Si llegó un archivo,
      lo subimos a Cloudinary.
    */

    if (req.file) {

      const resultado =
        await subirBufferACloudinary(
          req.file.buffer,
          `club_${Date.now()}`,
          "fmj/clubes"
        );

      logo =
        resultado.secure_url;

      logoPublicId =
        resultado.public_id;
    }


    const club =
      await Club.create({

        nombre,

        logo,
        logoPublicId,

        ubicacion:
          normalizarTexto(
            req.body.ubicacion
          ),

        telefono:
          normalizarTexto(
            req.body.telefono
          ),

        email:
          normalizarTexto(
            req.body.email
          ),

        facebook:
          normalizarTexto(
            req.body.facebook
          ),

        instagram:
          normalizarTexto(
            req.body.instagram
          ),

        puntajeTotal:
          normalizarNumero(
            req.body.puntajeTotal
          ),

        ranking:
          normalizarNumero(
            req.body.ranking
          ),
      });


    return res
      .status(201)
      .json(club);

  } catch (error) {

    console.error(
      "Error creando club:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error creando club",
      error: error.message,
    });
  }
}


/*
=========================================================
PUT - ACTUALIZAR CLUB
=========================================================
*/

export async function actualizarClub(req, res) {
  try {

    const club =
      await Club.findById(
        req.params.id
      );

    if (!club) {
      return res.status(404).json({
        mensaje:
          "Club no encontrado",
      });
    }


    const nombre =
      normalizarTexto(
        req.body.nombre
      );


    if (!nombre) {
      return res.status(400).json({
        mensaje:
          "El nombre de la institución es obligatorio",
      });
    }


    /*
      Si se cambia el nombre,
      verificamos que no choque
      con otro club.
    */

    const otroClub =
      await Club.findOne({
        nombre,
        _id: {
          $ne: club._id,
        },
      });


    if (otroClub) {
      return res.status(409).json({
        mensaje:
          "Ya existe otra institución con ese nombre",
      });
    }


    /*
      Actualizamos los datos.
    */

    club.nombre =
      nombre;

    club.ubicacion =
      normalizarTexto(
        req.body.ubicacion
      );

    club.telefono =
      normalizarTexto(
        req.body.telefono
      );

    club.email =
      normalizarTexto(
        req.body.email
      );

    club.facebook =
      normalizarTexto(
        req.body.facebook
      );

    club.instagram =
      normalizarTexto(
        req.body.instagram
      );

    club.puntajeTotal =
      normalizarNumero(
        req.body.puntajeTotal
      );

    club.ranking =
      normalizarNumero(
        req.body.ranking
      );


    /*
      Si se subió un nuevo logo,
      reemplazamos el anterior.
    */

    if (req.file) {

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
    }


    await club.save();


    return res.json({
      mensaje:
        "Club actualizado correctamente",

      club,
    });

  } catch (error) {

    console.error(
      "Error actualizando club:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error actualizando club",

      error: error.message,
    });
  }
}


/*
=========================================================
DELETE - ELIMINAR CLUB
=========================================================
*/

export async function eliminarClub(req, res) {
  try {

    const club =
      await Club.findById(
        req.params.id
      );

    if (!club) {
      return res.status(404).json({
        mensaje:
          "Club no encontrado",
      });
    }


    await Club.findByIdAndDelete(
      req.params.id
    );


    return res.json({
      mensaje:
        "Club eliminado correctamente",
    });

  } catch (error) {

    console.error(
      "Error eliminando club:",
      error
    );

    return res.status(500).json({
      mensaje:
        "Error eliminando club",

      error: error.message,
    });
  }
}