import { Router } from "express";
import { createSale, getAllSales, getSaleById, updateSale, deleteSale } from "../controllers/salesController.js";
import { createSaleSchema, updateSaleSchema } from "../validations/expenseSale.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_SALE]), validator(createSaleSchema), createSale);
router.get("/", authenticate, authorizePermission([Permission.READ_SALE]), getAllSales);
router.get("/:id", authenticate, authorizePermission([Permission.READ_SALE]), getSaleById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_SALE]), validator(updateSaleSchema), updateSale);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_SALE]), deleteSale);

export default router;
