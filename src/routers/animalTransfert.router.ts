import { Router } from "express";
import {
  createAnimalTransfer,
  getAllAnimalTransfers,
  getAnimalTransferById,
  updateAnimalTransfer,
  deleteAnimalTransfer,
} from "../controllers/AnimalTransferController.js";
import { createAnimalTransferSchema, updateAnimalTransferSchema } from "../validations/animalTransfer.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createAnimalTransferSchema), createAnimalTransfer);
router.get("/", getAllAnimalTransfers);
router.get("/:id", getAnimalTransferById);
router.put("/:id", validator(updateAnimalTransferSchema), updateAnimalTransfer);
router.delete("/:id", deleteAnimalTransfer);

export default router;
