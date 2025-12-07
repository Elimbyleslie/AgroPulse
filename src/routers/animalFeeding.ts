import {
    createAnimalFeeding,
    deleteAnimalFeeding,
    getAllAnimalFeedings,
    getAnimalFeedingById,
    updateAnimalFeeding
} from '../controllers/animalFeedingController.js';
import { Router } from 'express';
import { createAnimalFeedingSchema, updateAnimalFeedingSchema } from '../validations/animalFeeding.js';
import { validator } from '../middlewares/validator.middleware.js';

const router = Router();

router.post("/", validator(createAnimalFeedingSchema), createAnimalFeeding);
router.get("/", getAllAnimalFeedings);
router.get("/:id", getAnimalFeedingById);
router.put("/:id", validator(updateAnimalFeedingSchema),updateAnimalFeeding);
router.delete("/:id", deleteAnimalFeeding);

export default router;