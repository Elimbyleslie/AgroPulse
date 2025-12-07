import { EquipmentStatus } from '../../generated/prisma/enums.js';

export interface Equipement {
    id: number;
    farmId: number;
    name: string;
    description?: string;
    purchaseDate: Date;
    status: EquipmentStatus;
    value?: number;
    maintenanceDate?: Date;
}