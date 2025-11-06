
import { Router } from 'express';
import {
  getAllProduction,
  getProductionById,
  createProduction,
  updateProduction,
  deleteProduction,
  getProductionStats,
  getProductionByFerme
} from '../controllers/production.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAllProduction);
router.get('/stats', getProductionStats);
router.get('/ferme/:fermeId', getProductionByFerme);
router.get('/:id', getProductionById);
router.post('/', createProduction);
router.put('/:id', updateProduction);
router.delete('/:id', deleteProduction);

export default router;