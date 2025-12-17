import { Router } from "express";
import { createExpenseCategory, getAllExpenseCategories, getExpenseCategoryById, updateExpenseCategory, deleteExpenseCategory } from "../controllers/expenseCategoryController.js";
import { createExpenseCategorySchema, updateExpenseCategorySchema } from "../validations/expenseSale.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_EXPENSE_CATEGORY]), validator(createExpenseCategorySchema), createExpenseCategory);
router.get("/", authenticate, authorizePermission([Permission.READ_EXPENSE_CATEGORY]), getAllExpenseCategories);
router.get("/:id", authenticate, authorizePermission([Permission.READ_EXPENSE_CATEGORY]), getExpenseCategoryById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_EXPENSE_CATEGORY]), validator(updateExpenseCategorySchema), updateExpenseCategory);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_EXPENSE_CATEGORY]), deleteExpenseCategory);

export default router;
