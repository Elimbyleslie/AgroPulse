export interface AnimalVaccination {
  id?: number;
  animalId?: number ;
  lotId?: number ;
  vaccineName?: string;
  dateGiven?: Date ;
  nextDue?: Date ;
  administeredBy?: number ;
}
