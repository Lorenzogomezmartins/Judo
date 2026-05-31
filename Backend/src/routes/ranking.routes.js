import { Router } from "express";

import { importarRankingDesdeSheets } from "../controllers/ranking/importarRanking.controller.js";
import { listarRanking } from "../controllers/ranking/listarRanking.controller.js";

const router = Router();

router.post("/importar-sheets", importarRankingDesdeSheets);
router.get("/", listarRanking);

export default router;