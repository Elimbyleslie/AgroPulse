import { Router } from "express";
import {
  createHerd,
  getAllHerds,
  getHerdById,
  updateHerd,
  deleteHerd,
} from "../controllers/HerdController.js";
import { herdSchema } from "../validations/herd.js";
import {validator} from "../middlewares/validator.middleware.js"; 
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_HERD]), validator(herdSchema), createHerd);
router.get("/", authenticate, authorizePermission([Permission.READ_HERD]), getAllHerds);
router.get("/:id", authenticate, authorizePermission([Permission.READ_HERD]), getHerdById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_HERD]), validator(herdSchema), updateHerd);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_HERD]), deleteHerd);

export default router;
