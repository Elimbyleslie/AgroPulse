import {
    createFarmTask,
    getAllFarmTasks,
    getFarmTaskById,
    updateFarmTask,
    deleteFarmTask
}from '../controllers/FarmTaskController.js';
import {validator} from '../middlewares/validator.middleware.js';
import { createFarmTaskSchema, updateFarmTaskSchema } from '../validations/farmTask.js';
import { Router } from 'express';

const router = Router();

router.post("/", validator(createFarmTaskSchema), createFarmTask);
router.get("/", getAllFarmTasks);
router.get("/:id", getFarmTaskById);
router.put("/:id", validator(updateFarmTaskSchema), updateFarmTask);
router.delete("/:id", deleteFarmTask);

export default router;