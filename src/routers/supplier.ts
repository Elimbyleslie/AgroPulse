import { Router } from "express";
import {
  getAllFeedSuppliers,
  createFeedSupplier,
  getFeedSupplierById,
  updateFeedSupplier,
  deleteFeedSupplier,
} from "../controllers/SupplierController.js";
import {
  createFeedSupplierSchema,
  updateFeedSupplierSchema,
} from "../validations/feed.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_FEED_SUPPLIER]), validator(createFeedSupplierSchema), createFeedSupplier);
router.get("/", authenticate, authorizePermission([Permission.READ_FEED_SUPPLIER]), getAllFeedSuppliers);
router.get("/:id", authenticate, authorizePermission([Permission.READ_FEED_SUPPLIER]), getFeedSupplierById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_FEED_SUPPLIER]), validator(updateFeedSupplierSchema), updateFeedSupplier);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_FEED_SUPPLIER]),  deleteFeedSupplier);

export default router;
