import { Router } from "express";
import {
  createStockMovement,
  getAllStockMovements,
  getStockMovementById,
  updateStockMovement,
  deleteStockMovement,
} from "../controllers/stockMovementController.js";
import {
  createStockMovementSchema,updateStockMovementSchema
} from "../validations/stockMovement.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizePermission([Permission.CREATE_STOCK_MOVEMENT]),
  validator(createStockMovementSchema),
  createStockMovement
);

router.get(
  "/",
  authenticate,
  authorizePermission([Permission.READ_STOCK_MOVEMENT]),
  getAllStockMovements
);

router.get(
  "/:id",
  authenticate,
  authorizePermission([Permission.READ_STOCK_MOVEMENT]),
  getStockMovementById
);

router.put(
  "/:id",
  authenticate,
  authorizePermission([Permission.UPDATE_STOCK_MOVEMENT]),
  validator(updateStockMovementSchema),
updateStockMovement
);

router.delete(
  "/:id",
  authenticate,
  authorizePermission([Permission.DELETE_STOCK_MOVEMENT]),
  deleteStockMovement
);

export default router;