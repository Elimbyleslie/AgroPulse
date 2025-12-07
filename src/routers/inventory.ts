import {
    getAllInventories,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory
 } from '../controllers/inventoryController.js';

 import { Router } from 'express';
 import { createInventorySchema, updateInventorySchema } from '../validations/inventory.js';
 import { validator } from '../middlewares/validator.middleware.js';

    const router = Router();

    router.post("/", validator(createInventorySchema), createInventory);
    router.get("/", getAllInventories);
    router.get("/:id", getInventoryById);
    router.put("/:id", validator(updateInventorySchema), updateInventory);
    router.delete("/:id", deleteInventory);

    export default router