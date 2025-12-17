import { Router } from "express";
import { createSaleItem, getAllSaleItems, getSaleItemById, updateSaleItem, deleteSaleItem } from "../controllers/salesItemsController.js";
import { createSaleItemSchema, updateSaleItemSchema } from "../validations/expenseSale.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_SALE_ITEM]), validator(createSaleItemSchema), createSaleItem);
router.get("/", authenticate, authorizePermission([Permission.READ_SALE_ITEM]), getAllSaleItems);
router.get("/:id", authenticate, authorizePermission([Permission.READ_SALE_ITEM]), getSaleItemById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_SALE_ITEM]), validator(updateSaleItemSchema), updateSaleItem);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_SALE_ITEM]), deleteSaleItem);
export default router;
