// src/routes/usuarioRoutes.js
import express from "express";
import { uploadFotoUsuario } from "../middlewares/uploadFotoUsuario.js";

import crearUsuario from "../controllers/usuarios/crearUsuario.js";
import listarUsuarios from "../controllers/usuarios/listarUsuarios.js";
import obtenerUsuario from "../controllers/usuarios/obtenerUsuario.js";
import modificarUsuario from "../controllers/usuarios/modificarUsuario.js";
import eliminarUsuario from "../controllers/usuarios/eliminarUsuario.js";
import obtenerPuntos from "../controllers/usuarios/obtenerPuntos.js";
import sumarPuntos from "../controllers/usuarios/sumarPuntos.js";
import restarPuntos from "../controllers/usuarios/restarPuntos.js";
import inscribirseTorneo from "../controllers/usuarios/InscribirseTorneos.js";
import bajarseDeTorneo from "../controllers/usuarios/bajarseDeTorneo.js";
import { authMiddleware, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ENDPOINT DE PRUEBA
router.get("/test", (req, res) => {
  console.log("🎯 Endpoint /test de usuarios llamado");
  res.json({
    mensaje: "Ruta de usuarios funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

// Públicas o semipúblicas
router.post("/", uploadFotoUsuario.single("ft"), crearUsuario);
router.get("/", listarUsuarios);
router.get("/:id", obtenerUsuario);
router.get("/:id/puntos", obtenerPuntos);

// Protegidas admin
router.put(
  "/:id",
  authMiddleware,
  adminOnly,
  uploadFotoUsuario.single("ft"),
  modificarUsuario
);

router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  eliminarUsuario
);

router.post(
  "/:id/sumar",
  authMiddleware,
  adminOnly,
  sumarPuntos
);

router.post(
  "/:id/restar",
  authMiddleware,
  adminOnly,
  restarPuntos
);

// Según tu lógica, estas podrían quedar públicas o requerir usuario logueado
router.post("/torneos/inscribirse", inscribirseTorneo);
router.post("/torneos/bajarse", bajarseDeTorneo);

export default router;