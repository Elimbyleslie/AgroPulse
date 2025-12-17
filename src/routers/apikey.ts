import {
    createApiKey, deleteApiKey, getAllApiKeys, getApiKeyById, updateApiKey
} from '../controllers/apiKeyController.js';
import { createApiKeySchema } from '../validations/apikey.js';
import { validator } from '../middlewares/validator.middleware.js';
import { Router } from 'express';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = Router();
router.post("/", authenticate, authorizePermission([Permission.CREATE_API_KEY]), validator(createApiKeySchema), createApiKey);
router.get("/", authenticate, authorizePermission([Permission.READ_API_KEY]), getAllApiKeys);
router.get("/:id", authenticate, authorizePermission([Permission.READ_API_KEY]), getApiKeyById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_API_KEY]), updateApiKey);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_API_KEY]), deleteApiKey);

export default router;