import  {
getAllOrganizationInvoices,
createInvoice,
updateInvoiceStatus,
deleteInvoice
} from '../controllers/invoiceController.js';
import { Router } from 'express';
import { validator } from '../middlewares/validator.middleware.js';
import {createInvoiceSchema , updateInvoiceSchema} from '../validations/invoice.js';

const router = Router();

router.get("/",  getAllOrganizationInvoices );
router.post("/",validator(createInvoiceSchema) , createInvoice);
router.put("/:id",validator(updateInvoiceSchema) , updateInvoiceStatus);
router.delete("/:id", deleteInvoice);

export default router;