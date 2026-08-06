import {
createRole,
getAllRoles,
getRoleById,
updateRole,
deleteRole,
} from "../controllers/rolesController.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { createRoleSchema, updateRoleSchema } from "../validations/usersRoles.js";
import { validator } from "../middlewares/validator.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/",
    authenticate,
    authorizePermission([Permission.CREATE_ROLE]),
    validator(createRoleSchema),
    createRole
);
router.get("/",
    authenticate,
    authorizePermission([Permission.READ_ROLE]),
    getAllRoles
);
router.get("/:id",
    authenticate,
    authorizePermission([Permission.READ_ROLE]),
    getRoleById
);
router.put("/:id",
    authenticate,
    authorizePermission([Permission.UPDATE_ROLE]),
    validator(updateRoleSchema),
    updateRole
);
router.delete("/:id",
    authenticate,
    authorizePermission([Permission.DELETE_ROLE]),
    deleteRole
);

export default router;
