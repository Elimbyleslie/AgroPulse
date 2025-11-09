import auth from './auth.router.js';
import user from './user.router.js';
import audit from './audit.router.js';
// import { Router } from 'express';

const router={
    auth,
    audit,
    user,
}
export default router;