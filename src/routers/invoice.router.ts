import  {
getAllOrganizationInvoices,
createInvoice,
updateInvoiceStatus,
deleteInvoice,
getInvoiceById
} from '../controllers/invoiceController.js';
import { Router } from 'express';
import { validator } from '../middlewares/validator.middleware.js';
import {createInvoiceSchema , updateInvoiceSchema} from '../validations/invoice.js';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = Router();

router.get("/", authenticate, authorizePermission([Permission.READ_INVOICE]), getAllOrganizationInvoices );
router.get("/:id", authenticate, authorizePermission([Permission.READ_INVOICE]), getInvoiceById);
router.post("/", authenticate, authorizePermission([Permission.CREATE_INVOICE]), validator(createInvoiceSchema), createInvoice);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_INVOICE]), validator(updateInvoiceSchema), updateInvoiceStatus);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_INVOICE]), deleteInvoice);

export default router;