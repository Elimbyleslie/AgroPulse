import {
    createEquipmentMaintenance,
    deleteEquipmentMaintenance,
    getAllEquipmentMaintenances,
    getEquipmentMaintenanceById,
    updateEquipmentMaintenance
} from '../controllers/EquipmentMaintenanceController.js'
import {validator} from '../middlewares/validator.middleware.js';
import { createEquipmentMaintenanceSchema, updateEquipmentMaintenanceSchema } from '../validations/equipmentMaintenance.js';
import {authenticate, authorizePermission} from '../middlewares/auth.js';
import {Permission} from '../helpers/permissions.js';
import { Router } from 'express';

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_EQUIPMENT_MAINTENANCE]), validator(createEquipmentMaintenanceSchema), createEquipmentMaintenance);
router.get("/", authenticate, authorizePermission([Permission.READ_EQUIPMENT_MAINTENANCE]), getAllEquipmentMaintenances);
router.get("/:id", authenticate, authorizePermission([Permission.READ_EQUIPMENT_MAINTENANCE]), getEquipmentMaintenanceById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_EQUIPMENT_MAINTENANCE]), validator(updateEquipmentMaintenanceSchema), updateEquipmentMaintenance);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_EQUIPMENT_MAINTENANCE]), deleteEquipmentMaintenance);

export default router;