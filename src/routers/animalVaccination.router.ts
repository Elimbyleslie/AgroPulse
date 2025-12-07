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

    const router = Router();

    router.post("/", validator(createAnimalVaccinationSchema), createAnimalVaccination);
    router.get("/", getAllAnimalVaccinations);
    router.get("/:id", getAnimalVaccinationById);
    router.put("/:id", validator(updateAnimalVaccinationSchema), updateAnimalVaccination);
    router.delete("/:id", deleteAnimalVaccination);

export default router;
