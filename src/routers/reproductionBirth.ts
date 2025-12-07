import { Router } from "express";
import {
  createReproductionWithBirth,
  getAllReproductionWithBirth,
} from "../controllers/reproductionBirthController.js";

import {
  createReproductionWithBirthSchema,
} from "../validations/reproductionWithBirth.js";

import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createReproductionWithBirthSchema), createReproductionWithBirth);
router.get("/", getAllReproductionWithBirth);

export default router;
