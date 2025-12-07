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

const router = Router();

router.post("/", validator(createFeedSupplierSchema), createFeedSupplier);
router.get("/", getAllFeedSuppliers);
router.get("/:id", getFeedSupplierById);
router.put("/:id", validator(updateFeedSupplierSchema), updateFeedSupplier);
router.delete("/:id", deleteFeedSupplier);

export default router;
