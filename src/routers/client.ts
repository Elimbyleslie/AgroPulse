import { createClient, getAllClients, getClientById, updateClient, deleteClient } from "../controllers/clientController.js";
import { Router } from "express";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { createClientSchema, updateClientSchema } from "../validations/client.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizePermission([Permission.CREATE_CLIENT]),
  validator(createClientSchema),
  createClient,
);
router.get(
  "/",
  authenticate,
  authorizePermission([Permission.READ_CLIENT]),
  getAllClients,
);
router.get(
  "/:id",
  authenticate,
  authorizePermission([Permission.READ_CLIENT]),
  getClientById,
);
router.put(
  "/:id",
  authenticate,
  authorizePermission([Permission.UPDATE_CLIENT]),
  validator(updateClientSchema),
  updateClient,
);
router.delete(
  "/:id",
  authenticate,
  authorizePermission([Permission.DELETE_CLIENT]),
  deleteClient,
);

export default router;