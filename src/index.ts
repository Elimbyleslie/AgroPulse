import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import des routes
import authRoutes from './routers/auth.router.js';
import userRoutes from './routers/user.router.js';
import auditRoute from './routers/audit.router.js';


// Import des middlewares
import { errorHandler, notFound } from './middlewares/errorHandle.js';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});


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
app.use('/api/audit', auditRoute);


// Middleware pour les routes non trouvées
app.use(notFound);

// Middleware de gestion d'erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
     console.log('==================================================================');
   console.log('=================================================================');
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` API disponible sur http://localhost:${PORT}/api`);
      console.log('==================================================================');
      console.log('==================================================================');
});