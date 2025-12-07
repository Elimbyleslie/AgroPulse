import {
    createEquipment, deleteEquipment, getAllEquipments, getEquipmentById, updateEquipment
} from '../controllers/equipementsController.js'
import {validator} from '../middlewares/validator.middleware.js';
import { createEquipementSchema, updateEquipementSchema } from '../validations/equipment.js';
import { Router } from 'express';

const router = Router();

router.post("/", validator(createEquipementSchema), createEquipment);
router.get("/", getAllEquipments);
router.get("/:id", getEquipmentById);
router.put("/:id", validator(updateEquipementSchema), updateEquipment);
router.delete("/:id", deleteEquipment);

export default router;