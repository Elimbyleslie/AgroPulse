// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client';

// dotenv.config();

// const app = express();
// const prisma = new PrismaClient();

// app.use(cors());
// app.use(express.json());

// app.get('/', (req, res) => {
//   res.json({ message: 'Backend is running ' });
// });


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(` Server running on http://localhost:${PORT}`);
// });









import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import des routes
import authRoutes from './routers/auth.router';
import userRoutes from './routers/user.router';
import fermeRoutes from './routers/fermes.router';
import animauxRoutes from './routers/animaux.router';
import lotRoutes from './routers/lot.router';
import transactionRoutes from './routers/transaction.router';
import productionRoutes from './routers/production.router';
import alimentationRoutes from './routers/allimentation.router';


// Import des middlewares
import { errorHandler, notFound } from './middlewares/errorHandle';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'API FarmManager is running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fermes', fermeRoutes);
app.use('/api/animaux', animauxRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/productions', productionRoutes);
// app.use('/api/sante', santeRoutes);
app.use('/api/alimentation', alimentationRoutes);
// app.use('/api/evenements', evenementRoutes);

// Middleware pour les routes non trouvées
app.use(notFound);

// Middleware de gestion d'erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` API disponible sur http://localhost:${PORT}/api`);
});