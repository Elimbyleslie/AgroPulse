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
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';
const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_ANIMAL_FEEDING]), validator(createAnimalFeedingSchema), createAnimalFeeding);
router.get("/", authenticate, authorizePermission([Permission.READ_ANIMAL_FEEDING]), getAllAnimalFeedings);
router.get("/:id", authenticate, authorizePermission([Permission.READ_ANIMAL_FEEDING]), getAnimalFeedingById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_ANIMAL_FEEDING]), validator(updateAnimalFeedingSchema),updateAnimalFeeding);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_ANIMAL_FEEDING]), deleteAnimalFeeding);
export default router;