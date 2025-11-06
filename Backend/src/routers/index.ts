import allimentation from './allimentation.router';
import auth from './auth.router';
import user from './user.router';
import fermes from './fermes.router';
import production from './production.router';
import transaction from './transaction.router';
import animaux from './animaux.router';
// import { Router } from 'express';

const router={
    allimentation,
    auth,
    user,
    fermes,
    production,
    transaction,
    animaux,
}
export default router;