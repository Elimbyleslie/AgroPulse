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
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_FARM_TASK]), validator(createFarmTaskSchema), createFarmTask);
router.get("/", authenticate, authorizePermission([Permission.READ_FARM_TASK]), getAllFarmTasks);
router.get("/:id", authenticate, authorizePermission([Permission.READ_FARM_TASK]), getFarmTaskById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_FARM_TASK]), validator(updateFarmTaskSchema), updateFarmTask);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_FARM_TASK]), deleteFarmTask);

export default router;