export interface Settings {
  id?: number;
  organizationId?: number;
  farmId?: number;

  // Configuration Générale
  currency: string;
  language: string;
  dateFormat: string;
  timezone: string;

  // Unités de Mesure
  weightUnit: string;
  volumeUnit: string;
  areaUnit: string;

  // Paramètres d'Élevage
  defaultSpeciesId?: number;
  defaultBreedId?: number;
  heatDetectionDays: number;
  gestationDuration: number;

  // Notifications
  enableEmailAlerts: boolean;
  enableSmsAlerts: boolean;
  lowStockThreshold: number;

  // Finance
  taxRate?: number;
  defaultPaymentMethod: PaymentMethod;

  // Apparence
  primaryColor?: string;
  logoUrl?: string;
  farmName?: string;

  createdAt?: string;
  updatedAt?: string;
}

export enum PaymentMethod {
  cash = "cash",
  mobile_money = "mobile_money",
  bank_transfer = "bank_transfer",
  orange_money = "orange_money",
  check = "check",
  card = "card",
  other = "other",
}