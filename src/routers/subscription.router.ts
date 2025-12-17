import {
getOrganizationSubscriptions,
createSubscription,
getSubscriptionById,
updateSubscription,
deleteSubscription,
} from '../controllers/subcriptionController.js';
import { Router } from 'express';
import { createSubscriptionSchema, updateSubscriptionSchema } from '../validations/subcription.js';
import { validator } from '../middlewares/validator.middleware.js';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = Router();
router.post("/", authenticate, authorizePermission([Permission.CREATE_SUBSCRIPTION]), validator(createSubscriptionSchema), createSubscription);
router.get("/", authenticate, authorizePermission([Permission.READ_SUBSCRIPTION]), getOrganizationSubscriptions);
router.get("/:id", authenticate, authorizePermission([Permission.READ_SUBSCRIPTION]), getSubscriptionById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_SUBSCRIPTION]), validator(updateSubscriptionSchema), updateSubscription);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_SUBSCRIPTION]), deleteSubscription);

export default router;