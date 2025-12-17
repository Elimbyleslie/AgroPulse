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
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_SPECIES]), validator(createSpeciesSchema), createSpecies);
router.get("/", authenticate, authorizePermission([Permission.READ_SPECIES]), getAllSpecies);
router.get("/:id", authenticate, authorizePermission([Permission.READ_SPECIES]), getSpeciesById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_SPECIES]), validator(updateSpeciesSchema), updateSpecies);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_SPECIES]), deleteSpecies);

export default router;
