export interface AnimalHealthRecord {
  id?: number;
  animalId?: number;
  lotId?: number;
  checkDate: Date;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  veterinarianId?: number;
}
