import {
    listGeneticPerformances,
    createGeneticPerformance,
    updateGeneticPerformance,
    deleteGeneticPerformance,
    getGeneticPerformanceByAnimalId,
    syncGeneticPerformance,
    getGeneticPerformanceStats
   
} from "../controllers/geneticPerformanceController.js"
import { Router } from "express";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { validator } from "../middlewares/validator.middleware.js";
import { createGeneticPerformanceSchema, updateGeneticPerformanceSchema } from "../validations/reproductionVlidation.js";
const router = Router();

router.get(
    "/",
    authenticate,
    authorizePermission([Permission.READ_GENETIC_PERFORMANCE]),
    listGeneticPerformances
);

router.get(
    "/stats",
    authenticate,
    authorizePermission([Permission.READ_GENETIC_PERFORMANCE]),
    getGeneticPerformanceStats
);

router.get(
    "/:animalId",
    authenticate,
    authorizePermission([Permission.READ_GENETIC_PERFORMANCE]),
    getGeneticPerformanceByAnimalId
);
router.post(
    "/",
    authenticate,
    authorizePermission([Permission.CREATE_GENETIC_PERFORMANCE]),
    validator(createGeneticPerformanceSchema),
    createGeneticPerformance
);
router.post(
    "/:animalId/calculate",
    authenticate,
    authorizePermission([Permission.CALCULATE_GENETIC_PERFORMANCE]),
    syncGeneticPerformance
);
router.put(
    "/:animalId",
    authenticate,
    authorizePermission([Permission.UPDATE_GENETIC_PERFORMANCE]),
    validator(updateGeneticPerformanceSchema),
    updateGeneticPerformance
);
router.delete(
    "/:id",
    authenticate,
    authorizePermission([Permission.DELETE_GENETIC_PERFORMANCE]),
    deleteGeneticPerformance
)




export default router;
