import {
    createSubscriptionPayment,
    deleteSubscriptionPayment,
    getSubscriptionPaymentById,
    updateSubscriptionPaymentStatus,
    getAllSubscriptionPayments
} from '../controllers/subcriptionPaymenController.js';
import { 
    createSubscriptionPaymentSchema,
    updateSubscriptionPaymentSchema,
} from '../validations/subcriptionPayment.js';
import { Router } from 'express';
import { validator } from '../middlewares/validator.middleware.js';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';


const router = Router();

router.post(
    "/",
    authenticate,
    authorizePermission([Permission.CREATE_SUBSCRIPTION]),
    validator(createSubscriptionPaymentSchema),
    createSubscriptionPayment,
);
router.get(
    "/",
    authenticate,
    authorizePermission([Permission.READ_SUBSCRIPTION]),
    getAllSubscriptionPayments,
);
router.get(
    "/:id",
    authenticate,
    authorizePermission([Permission.READ_SUBSCRIPTION]),
    getSubscriptionPaymentById,
);
router.put(
    "/:id",
    authenticate,
    authorizePermission([Permission.UPDATE_SUBSCRIPTION]),
    validator(updateSubscriptionPaymentSchema),
    updateSubscriptionPaymentStatus,
);
router.delete(
    "/:id",
    authenticate,
    authorizePermission([Permission.DELETE_SUBSCRIPTION]),
    deleteSubscriptionPayment,
);

export default router;