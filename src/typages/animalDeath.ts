export interface AnimalDeath {
  id?: number;
  animalId?: number;
  lotId?: number;
  dateOfDeath?: Date;
  cause?: string;
  recordedBy?: number;
  photo?: string;
}
