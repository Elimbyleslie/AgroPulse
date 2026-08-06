// routes/feedingPlan.routes.ts
import { Router } from "express";
import {
  createFeedingPlan,
  getAllFeedingPlans,
  getFeedingPlanById,
  updateFeedingPlan,
  deleteFeedingPlan,
  distributeFeeding
} from "../controllers/feedPlanController.js";
import { authenticate, authorizePermission } from '../middlewares/auth.js'
import { Permission } from "../helpers/permissions.js";
import { feedingPlanSchema} from '../validations/feedingPlan.js'
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();
router.post(
  "/",
  authenticate,
  authorizePermission([Permission.CREATE_FEEDING_PLAN]),
  validator(feedingPlanSchema),
    createFeedingPlan,
);
router.post(
  "/:id/distribute",
  authenticate,
  authorizePermission([Permission.CREATE_FEEDING_PLAN]),
  distributeFeeding,
)
router.get(
  "/",
  authenticate,
  authorizePermission([Permission.READ_FEEDING_PLAN]),
  getAllFeedingPlans,
);
router.get(
  "/:id",
  authenticate,
  authorizePermission([Permission.READ_FEEDING_PLAN]),
  getFeedingPlanById,
);


router.put(
  "/:id",
  authenticate,
  authorizePermission([Permission.UPDATE_FEEDING_PLAN]),
  updateFeedingPlan,
);
router.delete(
  "/:id",
  authenticate,
  authorizePermission([Permission.DELETE_FEEDING_PLAN]),
  deleteFeedingPlan,
);




export default router;