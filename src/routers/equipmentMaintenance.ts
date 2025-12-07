import {
    createEquipmentMaintenance,
    deleteEquipmentMaintenance,
    getAllEquipmentMaintenances,
    getEquipmentMaintenanceById,
    updateEquipmentMaintenance
} from '../controllers/EquipmentMaintenanceController.js'
import {validator} from '../middlewares/validator.middleware.js';
import { createEquipmentMaintenanceSchema, updateEquipmentMaintenanceSchema } from '../validations/equipmentMaintenance.js';
import { Router } from 'express';

const router = Router();

router.post("/", validator(createEquipmentMaintenanceSchema), createEquipmentMaintenance);
router.get("/", getAllEquipmentMaintenances);
router.get("/:id", getEquipmentMaintenanceById);
router.put("/:id", validator(updateEquipmentMaintenanceSchema), updateEquipmentMaintenance);
router.delete("/:id", deleteEquipmentMaintenance);

export default router;