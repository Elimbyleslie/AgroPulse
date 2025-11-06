
import { Router } from 'express';
import {
  getAllAlimentsStock,
  getAllHistoriquesAlimentation,
  getAlimentStockById,
  createAlimentStock,
  createHistoriqueAlimentation,
  updateAlimentStock,
  deleteAlimentStock,
  getAlimentationByLot,
  getAlimentationByAnimal,
  getStockFaible
} from '../controllers/allimentation.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Routes pour le stock d'aliments
router.get('/stock', getAllAlimentsStock);
router.get('/stock/faible', getStockFaible);
router.get('/stock/:id', getAlimentStockById);
router.post('/stock', createAlimentStock);
router.put('/stock/:id', updateAlimentStock);
router.delete('/stock/:id', deleteAlimentStock);

// Routes pour l'historique d'alimentation
router.get('/historique', getAllHistoriquesAlimentation);
router.get('/historique/lot/:lotId', getAlimentationByLot);
router.get('/historique/animal/:animalId', getAlimentationByAnimal);
router.post('/historique', createHistoriqueAlimentation);

export default router;