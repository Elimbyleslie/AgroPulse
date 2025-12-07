import { Router } from "express";
import { createExpenseCategory, getAllExpenseCategories, getExpenseCategoryById, updateExpenseCategory, deleteExpenseCategory } from "../controllers/expenseCategoryController.js";
import { createExpenseCategorySchema, updateExpenseCategorySchema } from "../validations/expenseSale.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createExpenseCategorySchema), createExpenseCategory);
router.get("/", getAllExpenseCategories);
router.get("/:id", getExpenseCategoryById);
router.put("/:id", validator(updateExpenseCategorySchema), updateExpenseCategory);
router.delete("/:id", deleteExpenseCategory);

export default router;
