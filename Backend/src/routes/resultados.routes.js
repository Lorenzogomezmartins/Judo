import express from "express";

import listarResultados from "../controllers/resultados/listarResultados.js";
import sincronizarResultadosFTP from "../controllers/resultados/sincronizarResultadosFTP.js";

const router = express.Router();

router.get("/", listarResultados);
router.post("/sincronizar-ftp", sincronizarResultadosFTP);

export default router;