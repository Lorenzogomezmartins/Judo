import { Router } from "express";

import { importarRankingDesdeSheets } from "../controllers/ranking/importarRanking.controller.js";
import { listarRanking } from "../controllers/ranking/listarRanking.controller.js";

const router = Router();

router.post("/cron/importar-sheets", (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({
      mensaje: "No autorizado",
    });
  }

  return importarRankingDesdeSheets(req, res);
});

router.post("/importar-sheets", importarRankingDesdeSheets);

router.get("/", listarRanking);

export default router;