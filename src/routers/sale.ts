import { Router } from "express";
import { createSale, getAllSales, getSaleById, updateSale, deleteSale } from "../controllers/salesController.js";
import { createSaleSchema, updateSaleSchema } from "../validations/expenseSale.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createSaleSchema), createSale);
router.get("/", getAllSales);
router.get("/:id", getSaleById);
router.put("/:id", validator(updateSaleSchema), updateSale);
router.delete("/:id", deleteSale);

export default router;
