import { Router } from "express";
import { createSaleItem, getAllSaleItems, getSaleItemById, updateSaleItem, deleteSaleItem } from "../controllers/salesItemsController.js";
import { createSaleItemSchema, updateSaleItemSchema } from "../validations/expenseSale.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createSaleItemSchema), createSaleItem);
router.get("/", getAllSaleItems);
router.get("/:id", getSaleItemById);
router.put("/:id", validator(updateSaleItemSchema), updateSaleItem);
router.delete("/:id", deleteSaleItem);

export default router;
