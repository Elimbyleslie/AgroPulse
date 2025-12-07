import { Router } from "express";
import { createLot, getAllLots, getLotById, updateLot, deleteLot } from "../controllers/lotController.js";
import { createLotSchema, updateLotSchema } from "../validations/lot.js";
import {validator} from "../middlewares/validator.middleware.js"; // Middleware qui applique Yup

const router = Router();

router.post("/", validator(createLotSchema), createLot);
router.get("/", getAllLots);
router.get("/:id", getLotById);
router.put("/:id", validator(updateLotSchema), updateLot);
router.delete("/:id", deleteLot);

export default router;