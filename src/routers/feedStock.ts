import { 
    createFeedStock,
    deleteFeedStock,
    getAllFeedStocks,
    getFeedStockById,
    updateFeedStock
} from '../controllers/feedStockController.js';
import { Router } from 'express';
import { createFeedStockSchema, updateFeedStockSchema } from '../validations/feedStock.js';
import { validator } from '../middlewares/validator.middleware.js';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = Router();

router.post("/",authenticate,authorizePermission([Permission.CREATE_FEEDSTOCK]), validator(createFeedStockSchema), createFeedStock);
router.get("/", authenticate, authorizePermission([Permission.READ_FEEDSTOCK]), getAllFeedStocks);
router.get("/:id", authenticate, authorizePermission([Permission.READ_FEEDSTOCK]), getFeedStockById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_FEEDSTOCK]), validator(updateFeedStockSchema), updateFeedStock);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_FEEDSTOCK]), deleteFeedStock);
export default router;