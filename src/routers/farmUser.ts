import {
getAllFarmUsers,
getFarmUserById,
createFarmUser,
getFarmUsersByFarmId,
deleteFarmUser,
} from '../controllers/farmUserController.js';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';
import { Router } from 'express';
import { createFarmUserSchema } from '../validations/farmUser.js';
import { validator } from '../middlewares/validator.middleware.js';

const router = Router();

router.get('/',
getAllFarmUsers,
authenticate,
authorizePermission([Permission.READ_FARM_USER])
);


router.post('/',
authenticate,
authorizePermission([Permission.CREATE_FARM_USER]),
validator(createFarmUserSchema),
createFarmUser
);

router.get('/farm/:farmId',
authenticate,
authorizePermission([Permission.READ_FARM_USER]),
getFarmUsersByFarmId
); 

router.get('/:id',
authenticate,
authorizePermission([Permission.READ_FARM_USER]),
getFarmUserById
);


router.delete('/:id',
authenticate,
authorizePermission([Permission.DELETE_FARM_USER]),
deleteFarmUser
);

export default router;
