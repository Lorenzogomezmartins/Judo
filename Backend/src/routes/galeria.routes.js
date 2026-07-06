import { Router } from "express";
import multer from "multer";

import crearFotoGaleria from "../controllers/galeria/crearFotoGaleria.js";
import listarFotosGaleria from "../controllers/galeria/listarFotosGaleria.js";
import obtenerFotoGaleria from "../controllers/galeria/obtenerFotoGaleria.js";
import actualizarFotoGaleria from "../controllers/galeria/actualizarFotoGaleria.js";
import eliminarFotoGaleria from "../controllers/galeria/eliminarFotoGaleria.js";
import darLikeGaleria from "../controllers/galeria/darLikeGaleria.js";

import { authMiddleware, adminOnly } from "../middlewares/authMiddleware.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get("/", listarFotosGaleria);
router.post("/:id/like", darLikeGaleria);
router.get("/:id", obtenerFotoGaleria);

router.post(
  "/",
  authMiddleware,
  adminOnly,
  upload.single("imagen"),
  crearFotoGaleria
);

router.put(
  "/:id",
  authMiddleware,
  adminOnly,
  upload.single("imagen"),
  actualizarFotoGaleria
);

router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  eliminarFotoGaleria
);

export default router;