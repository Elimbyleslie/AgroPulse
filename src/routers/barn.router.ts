import { createBarn, deleteBarn, getBarnById, getAllBarns } from "../controllers/barnController.js";
import { Router } from "express";
import { createBarnSchema}  from '../validations/barn.js'
import { validator } from "../middlewares/validator.middleware.js";
const router = Router();

router.post("/",validator(createBarnSchema) , createBarn);
router.get("/", getAllBarns);
router.get("/:id", getBarnById);
router.delete("/:id", deleteBarn);

export default router;