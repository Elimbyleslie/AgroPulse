export interface AnimalTreatment {
  id?: number;
  animalId?: number;
  lotId?: number ;
  treatmentName?: string;
  medication?: string;
  dosage?: string;
  startDate?: Date;
  endDate?: Date ;
  administeredBy?: number ;
}
