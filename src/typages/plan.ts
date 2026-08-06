export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
} 

export enum UnitStorage {
  MO = "MO",
  GO = "GO",
  TO = "TO",
}
export interface Plan {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  description: string;
  billingCycle: BillingCycle;
  userLimit: number;
  storageLimit: number;
  farmLimit: number;  
  animalLimit: number;
  unitStorage: UnitStorage;
}
