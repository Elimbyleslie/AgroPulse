import {
    createFeedPurchase,
    getAllFeedPurchases,
    getFeedPurchaseById,
    updateFeedPurchase,
    deleteFeedPurchase

} from '../controllers/feedPurchaseController.js';
import { createFeedPurchaseSchema , updateFeedPurchaseSchema} from '../validations/feed.js';
import { validator } from '../middlewares/validator.middleware.js';
import express from 'express';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = express.Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_FEED_PURCHASE]), validator(createFeedPurchaseSchema), createFeedPurchase);
router.get("/", authenticate, authorizePermission([Permission.READ_FEED_PURCHASE]), getAllFeedPurchases);
router.get("/:id", authenticate, authorizePermission([Permission.READ_FEED_PURCHASE]), getFeedPurchaseById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_FEED_PURCHASE]), validator(updateFeedPurchaseSchema), updateFeedPurchase);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_FEED_PURCHASE]), deleteFeedPurchase);

export default router;