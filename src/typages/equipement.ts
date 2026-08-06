export interface Equipement {
  id: number;
  farmId: number;
  name: string;
  description?: string;
  purchaseDate: Date;
  inventoryId:number;
  status: EquipmentStatus;
  maintenanceFrequency:MaintenanceFrequency,
  value?: number;
  maintenanceDate?: Date;
}

export enum MaintenanceFrequency {
  daily ="daily",
  weekly="weekly",
  monthly="monthy",
  quarterly="quarterly",
  yearly="yearly",
  custom="custom"
}

export enum EquipmentStatus {
  operational = "operational",
  underMaintenance = "underMaintenance",
  outOfService = "outOfService",
}

export interface EquipmentMaintenance {
  id : number;
  equipmentId:number;
  farmId:number;
  name:string;
  maintenanceDate: string;
  cost?:number;
  notes?:string;
  userId?: number;
}
