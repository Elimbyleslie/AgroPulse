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
const router = Router();

router.post("/" ,validator(createFarmSchema) ,createFarm);
router.get("/", getAllFarm);
router.get("/:id", getFarmById);
router.put("/:id" , validator(updateFarmSchema) ,updateFarm);
router.delete("/:id", deleteFarm);

export default router ;