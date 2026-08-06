import {
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    getRoleUsers,
} from "../controllers/userRoleController.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { assignRoleSchema } from "../validations/usersRoles.js";
import { validator } from "../middlewares/validator.middleware.js";
import { Router } from "express";

const router = Router();

router.post(
    "/assign",
    authenticate,
    authorizePermission([Permission.ASSIGN_ROLE]),
    validator(assignRoleSchema),
    assignRoleToUser
);
router.delete(
    "/remove",
    authenticate,
    authorizePermission([Permission.REMOVE_ROLE]),
    removeRoleFromUser
);

router.get(
    "/user/:userId",
    authenticate,
    authorizePermission([Permission.READ_USER_ROLES]),
    getUserRoles
);

router.get(
    "/role/:roleId",
    authenticate,
    authorizePermission([Permission.READ_USER_ROLES]),
    getRoleUsers
);

export default router;
