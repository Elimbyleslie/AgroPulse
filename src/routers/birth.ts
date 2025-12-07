import { Router } from "express";
import {
  createBirth,
  getAllBirths,
  getBirthById,
  updateBirth,
  deleteBirth,
} from "../controllers/birthController.js";

import {
  createBirthSchema,
  updateBirthSchema,
} from "../validations/birth.js";

import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createBirthSchema), createBirth);
router.get("/", getAllBirths);
router.get("/:id", getBirthById);
router.put("/:id", validator(updateBirthSchema), updateBirth);
router.delete("/:id", deleteBirth);

export default router;
