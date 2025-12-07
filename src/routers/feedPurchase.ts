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

const router = express.Router();

router.post("/", validator(createFeedPurchaseSchema), createFeedPurchase);
router.get("/", getAllFeedPurchases);
router.get("/:id", getFeedPurchaseById);
router.put("/:id", validator(updateFeedPurchaseSchema), updateFeedPurchase);
router.delete("/:id", deleteFeedPurchase);

export default router;