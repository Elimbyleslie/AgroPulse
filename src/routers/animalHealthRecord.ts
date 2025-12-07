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

const router = Router();

router.post("/", validator(createAnimalHealthRecordSchema), createAnimalHealthRecord);
router.get("/", getAllAnimalHealthRecords);
router.get("/:id", getAnimalHealthRecordById);
router.put("/:id", validator(updateAnimalHealthRecordSchema), updateAnimalHealthRecord);
router.delete("/:id", deleteAnimalHealthRecord);

export default router;
