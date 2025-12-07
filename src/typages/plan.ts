import { BillingCycle } from '../../generated/prisma/enums';


export interface Plan {
    id: number;
    name: string;
    price: number;
    durationDays: number;
    description: string;
    billingCycle: BillingCycle;
    userLimit: number;
    storageLimit: number;
    animalLimit: number;
}