import { Router } from "express";
import { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense } from "../controllers/expensesController.js";
import { createExpenseSchema, updateExpenseSchema } from "../validations/expenseSale.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createExpenseSchema), createExpense);
router.get("/", getAllExpenses);
router.get("/:id", getExpenseById);
router.put("/:id", validator(updateExpenseSchema), updateExpense);
router.delete("/:id", deleteExpense);

export default router;
