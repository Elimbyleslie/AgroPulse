import {
  createBreed,
  getAllBreeds,
  getBreedById,
  updateBreed,
  deleteBreed,
} from "../controllers/BreedController.js";
import { Router } from "express";
import { createBreedSchema, updateBreedSchema } from "../validations/breed.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_BREED]), validator(createBreedSchema), createBreed);
router.get("/", authenticate, authorizePermission([Permission.READ_BREED]), getAllBreeds);
router.get("/:id", authenticate, authorizePermission([Permission.READ_BREED]), getBreedById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_BREED]), validator(updateBreedSchema), updateBreed);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_BREED]), deleteBreed);

export default router;
