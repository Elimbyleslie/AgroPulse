import { createBarn, deleteBarn, getBarnById, getAllBarns,updateBarn } from "../controllers/barnController.js";
import { Router } from "express";
import { createBarnSchema , updateBarnSchema}  from '../validations/barn.js'
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
const router = Router();

router.post("/",authenticate, authorizePermission([Permission.CREATE_BARN]),validator(createBarnSchema) , createBarn);
router.get("/",authenticate,authorizePermission([Permission.READ_BARN]), getAllBarns);
router.get("/:id",authenticate,authorizePermission([Permission.READ_BARN]), getBarnById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_BARN]), validator(updateBarnSchema), updateBarn);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_BARN]), deleteBarn);
export default router;