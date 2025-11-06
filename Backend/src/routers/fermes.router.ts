
import { Router } from 'express';
import {
  getAllFermes,
  getFermeById,
  createFerme,
  updateFerme,
  deleteFerme,
//   getFermeStats
} from '../controllers/ferme.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

router.get('/', getAllFermes);
router.get('/:id', getFermeById);
// router.get('/:id/stats', getFermeStats);
router.post('/', authorize(['ADMIN', 'PROPRIETAIRE']), createFerme);
router.put('/:id', authorize(['ADMIN', 'PROPRIETAIRE']), updateFerme);
router.delete('/:id', authorize(['ADMIN']), deleteFerme);

export default router;