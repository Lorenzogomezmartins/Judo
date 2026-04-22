import express from "express";

import crearTorneo from "../controllers/torneos/crearTorneo.js";
import obtenerTorneoPorId from "../controllers/torneos/obtenerTorneoId.js";
import actualizarTorneo from "../controllers/torneos/actualizarTorneo.js";
import eliminarTorneo from "../controllers/torneos/eliminarTorneo.js";
import listarTorneos from "../controllers/torneos/listarTorneos..js";
import { authMiddleware, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Públicas
router.get("/", listarTorneos);
router.get("/:id", obtenerTorneoPorId);

// Protegidas
router.post("/", authMiddleware, adminOnly, crearTorneo);
router.put("/:id", authMiddleware, adminOnly, actualizarTorneo);
router.delete("/:id", authMiddleware, adminOnly, eliminarTorneo);

export default router;