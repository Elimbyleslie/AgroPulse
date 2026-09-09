import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  createInvitation,
  getInvitationByToken,
  getOrganizationInvitations,
  deleteInvitation,
} from "../controllers/invitationController.js";
import { Permission } from "../helpers/permissions.js";
import { authorizePermission } from "../middlewares/auth.js";
const router = Router();

// Publique — utilisée par la page d'inscription
router.get("/invitations/:token",
     getInvitationByToken);

// Owner uniquement — utilisée par la page de gestion des invitations
router.post(
  "/organizations/:organizationId/invitations",
  authenticate,
  authorizePermission([Permission.CREATE_INVITATION]),
  createInvitation,
);
router.get("/organizations/:organizationId/invitations", 
    authenticate,
    authorizePermission([Permission.READ_INVITATION]),
     getOrganizationInvitations);
router.delete("/invitations/:id",
     authenticate,
     authorizePermission([Permission.DELETE_INVITATION]),
      deleteInvitation);

export default router;