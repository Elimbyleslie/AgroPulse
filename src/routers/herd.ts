import { Router } from "express";
import {
  createHerd,
  getAllHerds,
  getHerdById,
  updateHerd,
  deleteHerd,
} from "../controllers/HerdController.js";
import { herdSchema } from "../validations/herd.js";
import {validator} from "../middlewares/validator.middleware.js"; // Middleware qui applique Yup
const router = Router();

router.post("/", validator(herdSchema), createHerd);
router.get("/", getAllHerds);
router.get("/:id", getHerdById);
router.put("/:id", validator(herdSchema), updateHerd);
router.delete("/:id", deleteHerd);

export default router;
