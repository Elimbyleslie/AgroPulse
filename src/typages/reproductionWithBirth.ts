export interface ReproductionWithBirth {
  id?: number;
  femaleId?: number;
  maleId?: number;
  matingDate?: string; // ISO string
  expectedBirth?: string; // ISO string
  actualBirthDate?: string; // ISO string
  numberBorn?: number;
  notes?: string;

  // Si naissance enregistrée
  birthId?: number;
}
