import {
    assignPermissionToRole,
    removePermissionFromRole,
    getRolePermissions,
} 
from "../controllers/RolePermission.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { assignPermissionSchema } from "../validations/usersRoles.js";
import { validator } from "../middlewares/validator.middleware.js";
import { Router } from "express";

const router = Router();



router.post("/assign-permission",
    authenticate,
    authorizePermission([Permission.ASSIGN_PERMISSION]),
    validator(assignPermissionSchema),
    assignPermissionToRole
);

router.post("/remove-permission",
    authenticate,
    authorizePermission([Permission.REMOVE_PERMISSION]),
    validator(assignPermissionSchema),
    removePermissionFromRole
);
router.get("/:roleId",
    authenticate,
    authorizePermission([Permission.READ_ROLE_PERMISSIONS]),
    getRolePermissions
);
 


export default router;

