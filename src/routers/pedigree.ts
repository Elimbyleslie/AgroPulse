import {
    getPedigreeById,
    createPedigree,
    updatePedigree,
    deletePedigree,
    getGenealogyTree,
    checkConsanguinity 
} from "../controllers/pedigreeController.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { Router } from "express";
import { validator } from "../middlewares/validator.middleware.js";
import { createPedigreeSchema, updatePedigreeSchema } from "../validations/reproductionVlidation.js";

const router = Router();

router.get(
    "/", authenticate,
    authorizePermission([Permission.READ_PEDIGREE]),
    getGenealogyTree
);
router.post(
    "/",authenticate,
    authorizePermission([Permission.CREATE_PEDIGREE]),
    validator(createPedigreeSchema),
    createPedigree
);
router.get(
    "/:id",
    authenticate,
    authorizePermission([Permission.READ_PEDIGREE]),
    getPedigreeById
);
router.put(
    "/:id",
    authenticate,
    authorizePermission([Permission.UPDATE_PEDIGREE]),
    validator(updatePedigreeSchema),
    updatePedigree
);
router.delete(
    "/:id",
    authenticate,
    authorizePermission([Permission.DELETE_PEDIGREE])
);

export default router ;

