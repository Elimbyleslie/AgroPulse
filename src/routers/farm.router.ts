import {
getAllFarm,
getFarmById,
createFarm,
updateFarm,
deleteFarm,
}from '../controllers/farmController.js';
import { Router }  from 'express';
import { createFarmSchema , updateFarmSchema } from '../validations/farm.js';
import { validator} from '../middlewares/validator.middleware.js';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import {Permission} from '../helpers/permissions.js';

const router = Router();

router.post("/" ,authenticate, authorizePermission([Permission.CREATE_FARM]), validator(createFarmSchema) ,createFarm);
router.get("/", authenticate, authorizePermission([Permission.READ_FARM]), getAllFarm);
router.get("/:id", authenticate, authorizePermission([Permission.READ_FARM]), getFarmById);
router.put("/:id" , authenticate, authorizePermission([Permission.UPDATE_FARM]), validator(updateFarmSchema) ,updateFarm);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_FARM]), deleteFarm);

export default router ;