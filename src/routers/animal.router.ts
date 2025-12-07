import { Router } from "express";
import { createAnimal, getAllAnimals, getAnimalById, updateAnimal, deleteAnimal } from "../controllers/animalController.js";
import { createAnimalSchema, updateAnimalSchema } from "../validations/animal.js";
import {validator} from '../middlewares/validator.middleware.js';

const router = Router();

router.post("/", validator(createAnimalSchema), createAnimal);
router.get("/", getAllAnimals);
router.get("/:id", getAnimalById);
router.put("/:id", validator(updateAnimalSchema), updateAnimal);
router.delete("/:id", deleteAnimal);

export default router;
