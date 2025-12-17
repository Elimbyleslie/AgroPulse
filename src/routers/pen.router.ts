import {
    getAllPens,
    getPenById,
    createPen,
    updatePen,
    deletePen 
} from '../controllers/penController.js';
import { Router } from 'express';
import { createPenSchema, UpdatePenSchema } from '../validations/pen.js';
import { validator} from '../middlewares/validator.middleware.js';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = Router();
router.post("/", authenticate, authorizePermission([Permission.CREATE_PEN]), validator(createPenSchema), createPen);
router.get("/", authenticate, authorizePermission([Permission.READ_PEN]), getAllPens);
router.get("/:id", authenticate, authorizePermission([Permission.READ_PEN]), getPenById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_PEN]), validator(UpdatePenSchema), updatePen);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_PEN]), deletePen);
export default router