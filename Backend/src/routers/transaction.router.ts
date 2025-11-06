
import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStatsFinancieres,
  getTransactionsByCategorie,
  getSoldeFerme
} from '../controllers/transaction.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET Routes
router.get('/', getAllTransactions);
router.get('/stats', getStatsFinancieres);
router.get('/solde/:fermeId', getSoldeFerme);
router.get('/categorie/:categorie', getTransactionsByCategorie);
router.get('/:id', getTransactionById);

// POST Routes
router.post('/', createTransaction);

// PUT Routes
router.put('/:id', updateTransaction);

// DELETE Routes (Admin seulement)
router.delete('/:id', authorize(['ADMIN', 'PROPRIETAIRE']), deleteTransaction);

export default router;