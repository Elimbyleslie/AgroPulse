
import { Router } from 'express';
import {
  getAllLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
  getLotsByFerme,
  getLotsByStatut,
  addAnimalToLot
} from '../controllers/lot.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate); // Toutes les routes protégées

router.get('/', getAllLots);
router.get('/ferme/:fermeId', getLotsByFerme);
router.get('/statut/:statut', getLotsByStatut);
router.get('/:id', getLotById);
router.post('/', createLot);
router.post('/:lotId/animaux', addAnimalToLot);
router.put('/:id', updateLot);
router.delete('/:id', deleteLot);

export default router;