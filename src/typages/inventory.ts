import {InventoryCategory , Unit  } from '../../generated/prisma/enums.js';

export  interface Inventory{
    id?: number
    farmId: number
    name: string
    category: InventoryCategory
    quantity: number
    unit: Unit
    createdAt?: Date
    updatedAt?: Date
}