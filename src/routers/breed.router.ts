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

const router = Router();

router.post("/", validator(createBreedSchema), createBreed);
router.get("/", getAllBreeds);
router.get("/:id", getBreedById);
router.put("/:id", validator(updateBreedSchema), updateBreed);
router.delete("/:id", deleteBreed);

export default router;
