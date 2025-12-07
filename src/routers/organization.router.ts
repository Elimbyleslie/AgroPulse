import express from 'express';
import {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
  } from '../controllers/organizationController.js';
import { createOrganizationSchema } from '../validations/ogarnization.js';  
import { validator } from '../middlewares/validator.middleware.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Routes pour la gestion des organisations
router.post('/', validator(createOrganizationSchema), createOrganization);
router.get('/', getOrganizations,);
router.get('/:id', getOrganizationById);
router.put('/:id', updateOrganization);
router.delete('/:id', deleteOrganization);

export default router;