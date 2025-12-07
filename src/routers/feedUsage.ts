import { 
    getAllFeedUsages,
    getFeedUsageById,
    createFeedUsage,
    deleteFeedUsage,
    updateFeedUsage
} from '../controllers/feedUsageController.js'
import { createFeedUsageSchema , updateFeedUsageSchema }   from '../validations/feedUsage.js';
import { Router } from 'express';

import { validator } from '../middlewares/validator.middleware.js';

const router = Router();
router.post("/", validator(createFeedUsageSchema), createFeedUsage);
router.get("/", getAllFeedUsages);
router.get("/:id", getFeedUsageById);
router.put("/:id", validator(updateFeedUsageSchema), updateFeedUsage);
router.delete("/:id", deleteFeedUsage);

export default router;