import { Router } from "express";
import {
  createSpecies,
  getAllSpecies,
  getSpeciesById,
  updateSpecies,
  deleteSpecies,
} from "../controllers/speciesController.js";
import { createSpeciesSchema , updateSpeciesSchema } from "../validations/species.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createSpeciesSchema), createSpecies);
router.get("/", getAllSpecies);
router.get("/:id", getSpeciesById);
router.put("/:id", validator(updateSpeciesSchema), updateSpecies);
router.delete("/:id", deleteSpecies);

export default router;
