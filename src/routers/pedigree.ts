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

router.post(
  "/",
  authenticate,
  authorizePermission([Permission.CREATE_PEDIGREE]),
  validator(createPedigreeSchema),
  createPedigree
);

router.get(
  "/consanguinity/:animal1Id/:animal2Id",
  authenticate,
  authorizePermission([Permission.READ_PEDIGREE]),
  checkConsanguinity
);

// Routes avec paramètres
router.get(
  "/:animalId/tree",
  authenticate,
  authorizePermission([Permission.READ_PEDIGREE]),
  getGenealogyTree
);

router.get(
  "/:animalId",
  authenticate,
  authorizePermission([Permission.READ_PEDIGREE]),
  getPedigreeById
);

router.put(
  "/:animalId",
  authenticate,
  authorizePermission([Permission.UPDATE_PEDIGREE]),
  validator(updatePedigreeSchema),
  updatePedigree
);

router.delete(
  "/:animalId",
  authenticate,
  authorizePermission([Permission.DELETE_PEDIGREE]),
  deletePedigree
);

export default router;

