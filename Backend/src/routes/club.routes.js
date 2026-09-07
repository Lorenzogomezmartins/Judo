import express from "express";

import {
  obtenerClubes,
  obtenerClubPorId,
  crearClub,
  actualizarClub,
  eliminarClub,
} from "../controllers/Clubes/club.controller.js";

import {
  importarClubesDesdeSheets,
} from "../controllers/Clubes/importarClubes.controller.js";

import multer from "multer";


const router = express.Router();


/*
=========================================================
MULTER
=========================================================

El archivo queda en memoria para poder enviarlo
directamente a Cloudinary.
=========================================================
*/

const upload =
  multer({
    storage: multer.memoryStorage(),
  });


/*
=========================================================
CLUBES
=========================================================
*/

// GET /api/clubes
router.get(
  "/",
  obtenerClubes
);


// GET /api/clubes/:id
router.get(
  "/:id",
  obtenerClubPorId
);


// POST /api/clubes
router.post(
  "/",
  upload.single("logo"),
  crearClub
);


// PUT /api/clubes/:id
router.put(
  "/:id",
  upload.single("logo"),
  actualizarClub
);


// DELETE /api/clubes/:id
router.delete(
  "/:id",
  eliminarClub
);


/*
=========================================================
IMPORTAR CLUBES
=========================================================
*/

// POST /api/clubes/importar
router.post(
  "/importar",
  importarClubesDesdeSheets
);


export default router;