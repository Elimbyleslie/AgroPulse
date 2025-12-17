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
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = express.Router();

// Routes pour la gestion des organisations
router.post('/', authenticate, authorizePermission([Permission.CREATE_ORGANIZATION]), validator(createOrganizationSchema), createOrganization);
router.get('/', authenticate, authorizePermission([Permission.READ_ORGANIZATION]), getOrganizations);
router.get('/:id', authenticate, authorizePermission([Permission.READ_ORGANIZATION]), getOrganizationById);
router.put('/:id', authenticate, authorizePermission([Permission.UPDATE_ORGANIZATION]), updateOrganization);
router.delete('/:id', authenticate, authorizePermission([Permission.DELETE_ORGANIZATION]), deleteOrganization);

export default router;