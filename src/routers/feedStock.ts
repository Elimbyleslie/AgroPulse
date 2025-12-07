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

const router = Router();

router.post("/", validator(createFeedStockSchema), createFeedStock);
router.get("/", getAllFeedStocks);
router.get("/:id", getFeedStockById);
router.put("/:id", validator(updateFeedStockSchema), updateFeedStock);
router.delete("/:id", deleteFeedStock);

export default router;