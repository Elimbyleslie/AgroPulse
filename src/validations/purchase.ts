import * as Yup from "yup";
import {PurchaseStatus} from "../typages/purchase.js";


export const createPurchaseSchema = Yup.object().shape({
  supplierId: Yup.number().optional(),
  farmId: Yup.number().required("farmId est obligatoire"),
  totalAmount: Yup.number().optional(),
  itemName: Yup.string().required("le nom de l'article est obligatoire"),
  purchaseDate: Yup.date().optional(),
  invoiceNumber: Yup.string().optional(), 
  status: Yup.mixed<PurchaseStatus>().oneOf(Object.values(PurchaseStatus)).optional(),
});

export const updatePurchaseSchema = Yup.object().shape({
  supplierId: Yup.number().optional(),
  farmId: Yup.number().optional(),
  totalAmount: Yup.number().optional(),
  itemName: Yup.string().optional(),
  purchaseDate: Yup.date().optional(),
  invoiceNumber: Yup.string().optional(), 
  status: Yup.mixed<PurchaseStatus>().oneOf(Object.values(PurchaseStatus)).optional(),
});