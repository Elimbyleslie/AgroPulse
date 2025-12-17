import { Router } from "express";
import { createLot, getAllLots, getLotById, updateLot, deleteLot } from "../controllers/lotController.js";
import { createLotSchema, updateLotSchema } from "../validations/lot.js";
import {validator} from "../middlewares/validator.middleware.js"; // Middleware qui applique Yup
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_LOT]), validator(createLotSchema), createLot);
router.get("/", authenticate, authorizePermission([Permission.READ_LOT]), getAllLots);
router.get("/:id", authenticate, authorizePermission([Permission.READ_LOT]), getLotById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_LOT]), validator(updateLotSchema), updateLot);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_LOT]), deleteLot);

export default router;