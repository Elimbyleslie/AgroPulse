import {
    createEquipment, deleteEquipment, getAllEquipments, getEquipmentById, updateEquipment
} from '../controllers/equipementsController.js'
import {validator} from '../middlewares/validator.middleware.js';
import { createEquipementSchema, updateEquipementSchema } from '../validations/equipment.js';
import { Router } from 'express';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_EQUIPMENT]), validator(createEquipementSchema), createEquipment);
router.get("/", authenticate, authorizePermission([Permission.READ_EQUIPMENT]), getAllEquipments);
router.get("/:id", authenticate, authorizePermission([Permission.READ_EQUIPMENT]), getEquipmentById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_EQUIPMENT]), validator(updateEquipementSchema), updateEquipment);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_EQUIPMENT]), deleteEquipment);
export default router;