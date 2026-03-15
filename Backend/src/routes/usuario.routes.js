import express from "express";

import crearUsuario from "../controllers/usuarios/crearUsuario.js";
import listarUsuarios from "../controllers/usuarios/listarUsuarios.js";
import obtenerUsuario from "../controllers/usuarios/obtenerUsuario.js";
import modificarUsuario from "../controllers/usuarios/modificarUsuario.js";
import eliminarUsuario from "../controllers/usuarios/eliminarUsuario.js";
import obtenerPuntos from "../controllers/usuarios/obtenerPuntos.js";
import sumarPuntos from "../controllers/usuarios/sumarPuntos.js";
import restarPuntos from "../controllers/usuarios/restarPuntos.js";

const router = express.Router();

router.post("/", crearUsuario);
router.get("/", listarUsuarios);
router.get("/:id", obtenerUsuario);
router.put("/:id", modificarUsuario);
router.delete("/:id", eliminarUsuario);

router.get("/:id/puntos", obtenerPuntos);
router.post("/:id/sumar", sumarPuntos);
router.post("/:id/restar", restarPuntos);

export default router;
