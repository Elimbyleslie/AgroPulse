import { InvoiceStatus } from '../../generated/prisma/client.js'
export interface Invoices  {
id: number;
organizationId: number;
subscriptionId: number;
amount : number;
status:InvoiceStatus;
paymentMethod: string;
currency: string;
issuedAt: Date;
}