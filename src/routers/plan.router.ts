import {
    createPlan,
    getAllPlans,
    updatePlan,
    deletePlan,
    getPlanById
}from '../controllers/planController.js';
import express from 'express';
import { createPlanSchema } from '../validations/plan.js' ;
import { validator } from '../middlewares/validator.middleware.js';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';
const router = express.Router();
// Routes pour la gestion des plans
router.post('/', authenticate, authorizePermission([Permission.CREATE_PLAN]), validator(createPlanSchema), createPlan);
router.get('/', authenticate, authorizePermission([Permission.READ_PLAN]), getAllPlans);
router.put('/:id', authenticate, authorizePermission([Permission.UPDATE_PLAN]), updatePlan);
router.delete('/:id', authenticate, authorizePermission([Permission.DELETE_PLAN]), deletePlan);
router.get('/:id', authenticate, authorizePermission([Permission.READ_PLAN]), getPlanById);

export default router;