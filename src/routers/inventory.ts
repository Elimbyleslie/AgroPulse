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
 import { authenticate, authorizePermission } from '../middlewares/auth.js';
 import { Permission } from '../helpers/permissions.js';

    const router = Router();

    router.post("/", authenticate, authorizePermission([Permission.CREATE_INVENTORY]), validator(createInventorySchema), createInventory);
    router.get("/", authenticate, authorizePermission([Permission.READ_INVENTORY]), getAllInventories);
    router.get("/:id", authenticate, authorizePermission([Permission.READ_INVENTORY]), getInventoryById);
    router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_INVENTORY]), validator(updateInventorySchema), updateInventory);
    router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_INVENTORY]), deleteInventory);

    export default router