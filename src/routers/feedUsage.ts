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
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = Router();

router.post("/",authenticate, authorizePermission([Permission.CREATE_FEED_USAGE]), validator(createFeedUsageSchema), createFeedUsage);
router.get("/",authenticate, authorizePermission([Permission.READ_FEED_USAGE]), getAllFeedUsages);
router.get("/:id", authenticate, authorizePermission([Permission.READ_FEED_USAGE]), getFeedUsageById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_FEED_USAGE]), validator(updateFeedUsageSchema), updateFeedUsage);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_FEED_USAGE]), deleteFeedUsage);
export default router;