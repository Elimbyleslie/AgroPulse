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
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_TRANSFER]), validator(createAnimalTransferSchema), createAnimalTransfer);
router.get("/", authenticate, authorizePermission([Permission.READ_TRANSFER]), getAllAnimalTransfers);
router.get("/:id", authenticate, authorizePermission([Permission.READ_TRANSFER]), getAnimalTransferById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_TRANSFER]), validator(updateAnimalTransferSchema), updateAnimalTransfer);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_TRANSFER]), deleteAnimalTransfer);

export default router;
