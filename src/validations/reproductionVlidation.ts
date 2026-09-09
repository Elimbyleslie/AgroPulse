// validations/reproductionValidation.ts
import * as Yup from 'yup';

// ==================== REPRODUCTION CYCLE VALIDATION ====================

export const createCycleSchema = Yup.object({
  farmId: Yup.number().required('farmId est requis').positive(),
  animalId: Yup.number().required('animalId est requis').positive(),
  cycleType: Yup.string()
    .required('cycleType est requis')
    .oneOf(['chaleur', 'insemination', 'confirmation', 'echec']),
  startDate: Yup.date().required('startDate est requis'),
  endDate: Yup.date().nullable(),
  status: Yup.string().oneOf(['en_cours', 'confirme', 'echec', 'termine']),
  heatIntensity: Yup.number().min(1).max(5).nullable(),
  heatBehavior: Yup.string().nullable(),
  inseminationType: Yup.string().oneOf(['naturelle', 'artificielle']).nullable(),
  maleId: Yup.number().positive().nullable(),
  semenBatch: Yup.string().nullable(),
  technicianId: Yup.number().positive().nullable(),
  notes: Yup.string().nullable(),
});

export const updateCycleSchema = Yup.object({
  cycleType: Yup.string().oneOf(['chaleur', 'insemination', 'confirmation', 'echec']),
  startDate: Yup.date(),
  endDate: Yup.date().nullable(),
  status: Yup.string().oneOf(['en_cours', 'confirme', 'echec', 'termine']),
  heatIntensity: Yup.number().min(1).max(5).nullable(),
  heatBehavior: Yup.string().nullable(),
  inseminationType: Yup.string().oneOf(['naturelle', 'artificielle']).nullable(),
  maleId: Yup.number().positive().nullable(),
  semenBatch: Yup.string().nullable(),
  technicianId: Yup.number().positive().nullable(),
  notes: Yup.string().nullable(),
});

// ==================== GESTATION VALIDATION ====================

export const createGestationSchema = Yup.object({
  farmId: Yup.number().required('farmId est requis').positive(),
  animalId: Yup.number().required('animalId est requis').positive(),
  reproductionCycleId: Yup.number().required('reproductionCycleId est requis').positive(),
  inseminationDate: Yup.date().required('inseminationDate est requis'),
  expectedDeliveryDate: Yup.date()
    .required('expectedDeliveryDate est requis')
    .min(Yup.ref('inseminationDate'), 'La date prévue doit être après la date d\'insémination'),
  actualDeliveryDate: Yup.date().nullable(),
  status: Yup.string().oneOf(['en_attente', 'confirmee', 'en_cours', 'terminee', 'avortement']),
  confirmationDate: Yup.date().nullable(),
  confirmationMethod: Yup.string()
    .oneOf(['echographie', 'palpation', 'test_sanguin', 'observation'])
    .nullable(),
  numberOfOffspring: Yup.number().positive().nullable(),
  complications: Yup.string().nullable(),
  abortionDate: Yup.date().nullable(),
  abortionCause: Yup.string().nullable(),
  lastCheckDate: Yup.date().nullable(),
  veterinarianId: Yup.number().positive().nullable(),
  notes: Yup.string().nullable(),
});

export const updateGestationSchema = Yup.object({
  expectedDeliveryDate: Yup.date(),
  actualDeliveryDate: Yup.date().nullable(),
  status: Yup.string().oneOf(['en_attente', 'confirmee', 'en_cours', 'terminee', 'avortement']),
  confirmationDate: Yup.date().nullable(),
  confirmationMethod: Yup.string()
    .oneOf(['echographie', 'palpation', 'test_sanguin', 'observation'])
    .nullable(),
  numberOfOffspring: Yup.number().positive().nullable(),
  complications: Yup.string().nullable(),
  abortionDate: Yup.date().nullable(),
  abortionCause: Yup.string().nullable(),
  lastCheckDate: Yup.date().nullable(),
  veterinarianId: Yup.number().positive().nullable(),
  notes: Yup.string().nullable(),
});

// ==================== GESTATION CHECKUP VALIDATION ====================

export const createCheckupSchema = Yup.object({
  checkDate: Yup.date().required('checkDate est requis'),
  motherWeight: Yup.number().positive('Le poids doit être positif').nullable(),
  motherCondition: Yup.number()
    .min(1, 'L\'état corporel doit être entre 1 et 5')
    .max(5, 'L\'état corporel doit être entre 1 et 5')
    .nullable(),
  fetalHeartbeat: Yup.boolean().nullable(),
  fetalMovement: Yup.boolean().nullable(),
  complications: Yup.string().nullable(),
  veterinarianId: Yup.number().positive().nullable(),
  notes: Yup.string().nullable(),
});

export const updateCheckupSchema = Yup.object({
  checkDate: Yup.date(),
  motherWeight: Yup.number().positive('Le poids doit être positif').nullable(),
  motherCondition: Yup.number()
    .min(1, 'L\'état corporel doit être entre 1 et 5')
    .max(5, 'L\'état corporel doit être entre 1 et 5')
    .nullable(),
  fetalHeartbeat: Yup.boolean().nullable(),
  fetalMovement: Yup.boolean().nullable(),
  complications: Yup.string().nullable(),
  veterinarianId: Yup.number().positive().nullable(),
  notes: Yup.string().nullable(),
});

// reproductionValidation.ts

export const createGeneticPerformanceSchema = Yup.object({
  farmId: Yup.number()
    .required('farmId est requis')
    .positive(),
  animalId: Yup.number()
    .required('animalId est requis')
    .positive(),
  growthRate: Yup.number().nullable().optional(),
  birthWeight: Yup.number().nullable().optional(),
  weaningWeight: Yup.number().nullable().optional(),
  prolificityScore: Yup.number().nullable().optional(),
  maternalInstinct: Yup.number().min(1).max(10).nullable().optional(),
  diseaseResistance: Yup.number().min(1).max(10).nullable().optional(),
  inbreedingCoeff: Yup.number().min(0).max(1).nullable().optional(),
});

export const updateGeneticPerformanceSchema = Yup.object({
  growthRate: Yup.number().nullable().optional(),
  birthWeight: Yup.number().nullable().optional(),
  weaningWeight: Yup.number().nullable().optional(),
  prolificityScore: Yup.number().nullable().optional(),
  maternalInstinct: Yup.number().min(1).max(10).nullable().optional(),
  diseaseResistance: Yup.number().min(1).max(10).nullable().optional(),
  inbreedingCoeff: Yup.number().min(0).max(1).nullable().optional(),
});
// ==================== PEDIGREE VALIDATION ====================

export const createPedigreeSchema = Yup.object({
  animalId: Yup.number().required('animalId est requis').positive(),
  motherId: Yup.number().positive().nullable(),
  fatherId: Yup.number().positive().nullable(),
  maternalGrandmotherId: Yup.number().positive().nullable(),
  maternalGrandfatherId: Yup.number().positive().nullable(),
  paternalGrandmotherId: Yup.number().positive().nullable(),
  paternalGrandfatherId: Yup.number().positive().nullable(),
  generation4Ids: Yup.array().of(Yup.number().positive()).nullable(),
  verified: Yup.boolean(),
});

export const updatePedigreeSchema = Yup.object({
  motherId: Yup.number().positive().nullable(),
  fatherId: Yup.number().positive().nullable(),
  maternalGrandmotherId: Yup.number().positive().nullable(),
  maternalGrandfatherId: Yup.number().positive().nullable(),
  paternalGrandmotherId: Yup.number().positive().nullable(),
  paternalGrandfatherId: Yup.number().positive().nullable(),
  generation4Ids: Yup.array().of(Yup.number().positive()).nullable(),
  verified: Yup.boolean(),
});