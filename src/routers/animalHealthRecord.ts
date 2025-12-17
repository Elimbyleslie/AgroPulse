import { Router } from "express";
import {
  createAnimalHealthRecord,
  getAllAnimalHealthRecords,
  getAnimalHealthRecordById,
  updateAnimalHealthRecord,
  deleteAnimalHealthRecord,
} from "../controllers/animalHealthController.js";
import { createAnimalHealthRecordSchema, updateAnimalHealthRecordSchema } from "../validations/animalHealthRecord.js";
import {validator} from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
const router = Router();
  
router.post("/", authenticate, authorizePermission([Permission.CREATE_HEALTH_RECORD]), validator(createAnimalHealthRecordSchema), createAnimalHealthRecord);
router.get("/", authenticate, authorizePermission([Permission.READ_HEALTH_RECORD]), getAllAnimalHealthRecords);
router.get("/:id", authenticate, authorizePermission([Permission.READ_HEALTH_RECORD]), getAnimalHealthRecordById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_HEALTH_RECORD]), validator(updateAnimalHealthRecordSchema), updateAnimalHealthRecord);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_HEALTH_RECORD]), deleteAnimalHealthRecord);

export default router;
