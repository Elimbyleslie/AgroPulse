import {
    createPlan,
    getAllPlans,
    updatePlan,
    deletePlan
}from '../controllers/planController.js';
import express from 'express';
import { createPlanSchema } from '../validations/plan.js' ;
import { validator } from '../middlewares/validator.middleware.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();
// Routes pour la gestion des plans
router.post('/', authenticate, authorize(['ADMIN']),validator(createPlanSchema), createPlan);
router.get('/', authenticate, getAllPlans);
router.put('/:id', authenticate, authorize(['ADMIN']), updatePlan);
router.delete('/:id', authenticate, authorize(['ADMIN']), deletePlan);

export default router;