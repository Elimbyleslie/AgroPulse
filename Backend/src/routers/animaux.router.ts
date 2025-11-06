import { Router } from "express";
import {
  createAnimal,
  getAllAnimaux,
  getAnimalById,
  updateAnimal,
  deleteAnimal,
  getAnimauxByFerme,
  getAnimauxStats,
  updatePoidsAnimal,
  searchAnimaux,
} from "../controllers/animaux.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.get("/animaux", getAllAnimaux);
router.get('/animaux/:id',getAnimalById);
router.get('/animaux/Ferme',getAnimauxByFerme);
router.get('/animaux/stats',getAnimauxStats);
router.post('/animaux',createAnimal);
router.put('animaux',updateAnimal);
router.delete('/animaux',deleteAnimal);
router.put('/animaux/poids/',updatePoidsAnimal);
router.get('/animaux/recherche',searchAnimaux);

export default router;
