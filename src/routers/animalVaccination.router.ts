    import { Router } from "express";
    import {
    createAnimalVaccination,
    getAllAnimalVaccinations,
    getAnimalVaccinationById,
    updateAnimalVaccination,
    deleteAnimalVaccination,
    } from "../controllers/AnimalVaccinationController.js";

    import {validator} from "../middlewares/validator.middleware.js";
    import {
    createAnimalVaccinationSchema,
    updateAnimalVaccinationSchema,
    } from "../validations/animalVaccination.js";
    import { authenticate, authorizePermission } from "../middlewares/auth.js";
    import { Permission } from "../helpers/permissions.js";
    const router = Router();

    router.post("/", authenticate, authorizePermission([Permission.CREATE_VACCINATION]), validator(createAnimalVaccinationSchema), createAnimalVaccination);
    router.get("/", authenticate, authorizePermission([Permission.READ_VACCINATION]), getAllAnimalVaccinations);
    router.get("/:id", authenticate, authorizePermission([Permission.READ_VACCINATION]), getAnimalVaccinationById);
    router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_VACCINATION]), validator(updateAnimalVaccinationSchema), updateAnimalVaccination);
    router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_VACCINATION]), deleteAnimalVaccination);

export default router;
