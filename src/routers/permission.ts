import {
createPermission,
getAllPermissions,
getPermissionById,
updatePermission,
deletePermission,
} from "../controllers/permissionsController.js"
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { createPermissionSchema, updatePermissionSchema } from "../validations/usersRoles.js";
import { validator } from "../middlewares/validator.middleware.js";
import { Router } from "express";

const router = Router();
 
router.post("/",
    authenticate,
    authorizePermission([Permission.CREATE_PERMISSION]),
    validator(createPermissionSchema),
    createPermission
);

router.get("/",
    authenticate,
    authorizePermission([Permission.READ_PERMISSION]),
    getAllPermissions
);

router.get("/:id",
    authenticate,
    authorizePermission([Permission.READ_PERMISSION]),
    getPermissionById
);

router.put("/:id",
    authenticate,
    authorizePermission([Permission.UPDATE_PERMISSION]),
    validator(updatePermissionSchema),
    updatePermission
);

router.delete("/:id",
    authenticate,
    authorizePermission([Permission.DELETE_PERMISSION]),
    deletePermission
);

export default router;
