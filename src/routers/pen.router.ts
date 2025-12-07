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
const router = Router();
router.post("/" ,validator(createPenSchema) ,createPen);
router.get("/", getAllPens);
router.get("/:id", getPenById);
router.put("/:id" , validator(UpdatePenSchema), updatePen);
router.delete("/:id", deletePen);

export default router