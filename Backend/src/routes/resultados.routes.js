import express from "express";

import listarResultados from "../controllers/resultados/listarResultados.js";
import sincronizarResultadosFTP from "../controllers/resultados/sincronizarResultadosFTP.js";
import verResultadoDirecto from "../controllers/resultados/verResultadoHTML.js";

const router = express.Router();

router.get("/", listarResultados);
router.post("/sincronizar-ftp", sincronizarResultadosFTP);

// Ruta para ver el HTML del torneo directamente desde Hostinger
router.get("/:slug", verResultadoDirecto);

export default router;