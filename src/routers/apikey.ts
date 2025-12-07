import {
    createApiKey, deleteApiKey, getAllApiKeys, getApiKeyById, updateApiKey
} from '../controllers/apiKeyController.js';
import { createApiKeySchema } from '../validations/apikey.js';
import { validator } from '../middlewares/validator.middleware.js';
import { Router } from 'express';

const router = Router();
router.post("/", validator(createApiKeySchema), createApiKey);
router.get("/", getAllApiKeys);
router.get("/:id", getApiKeyById);
router.put("/:id", updateApiKey);
router.delete("/:id", deleteApiKey);

export default router;