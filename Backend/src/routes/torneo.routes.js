import express from "express";

import crearTorneo from "../controllers/torneos/crearTorneo.js";
import obtenerTorneos from "../controllers/torneos/obtenerTorneo.js";
import obtenerTorneoPorId from "../controllers/torneos/obtenerTorneoId.js";
import actualizarTorneo from "../controllers/torneos/actualizarTorneo.js";
import eliminarTorneo from "../controllers/torneos/eliminarTorneo.js";
import listarTorneos from "../controllers/torneos/listarTorneos..js";

const router = express.Router();


// CRUD
router.post("/", crearTorneo);
router.get("/", obtenerTorneos);
router.get("/", listarTorneos);
router.get("/:id", obtenerTorneoPorId);
router.put("/:id", actualizarTorneo);
router.delete("/:id", eliminarTorneo);

export default router;