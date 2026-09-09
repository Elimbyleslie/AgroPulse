export interface AnimalTreatment {
  id?: number;
  animalId?: number;
  inventoryId:number,  
  lotId?: number;
  treatmentName?: string;
  quantityUsed?: number;
  medication?: string;
  dosage?: string;
  startDate?: Date;
  endDate?: Date;
  administeredBy?: number;
  treated?:boolean
  farmId?:number;
  frequencyDays:number;
}
