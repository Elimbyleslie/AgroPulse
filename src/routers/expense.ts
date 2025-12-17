import { Router } from "express";
import { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense } from "../controllers/expensesController.js";
import { createExpenseSchema, updateExpenseSchema } from "../validations/expenseSale.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_EXPENSE]), validator(createExpenseSchema), createExpense);
router.get("/", authenticate, authorizePermission([Permission.READ_EXPENSE]), getAllExpenses);
router.get("/:id", authenticate, authorizePermission([Permission.READ_EXPENSE]), getExpenseById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_EXPENSE]), validator(updateExpenseSchema), updateExpense);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_EXPENSE]), deleteExpense);
export default router;
