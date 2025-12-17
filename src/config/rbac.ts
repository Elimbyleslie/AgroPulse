//role base access control 
import { Role } from '../typages/role.js';
import { Permission } from '../helpers/permissions.js';
import { create } from 'domain';

export const RBAC = {
  [Role.SUPER_ADMIN]: Object.values(Permission),

  [Role.ORGANIZATION_OWNER]: [
    Permission.READ_ORGANIZATION, Permission.UPDATE_ORGANIZATION,Permission.DELETE_ORGANIZATION,Permission.CREATE_ORGANIZATION,
    Permission.READ_SUBSCRIPTION, Permission.CREATE_SUBSCRIPTION, Permission.UPDATE_SUBSCRIPTION, Permission.DELETE_SUBSCRIPTION, Permission.MANAGE_USERS,
    Permission.READ_USER, Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER,
    Permission.READ_FARM, Permission.CREATE_FARM, Permission.UPDATE_FARM, Permission.DELETE_FARM,
    Permission.READ_REPORT, Permission.CREATE_REPORT, Permission.UPDATE_REPORT, Permission.DELETE_REPORT,
    Permission.READ_FINANCIAL_REPORT, Permission.CREATE_FINANCIAL_REPORT, Permission.UPDATE_FINANCIAL_REPORT, Permission.DELETE_FINANCIAL_REPORT,
    Permission.READ_PRODUCTION, Permission.CREATE_PRODUCTION, Permission.UPDATE_PRODUCTION, Permission.DELETE_PRODUCTION,
    Permission.READ_FEEDSTOCK, Permission.CREATE_FEEDSTOCK, Permission.UPDATE_FEEDSTOCK, Permission.DELETE_FEEDSTOCK,
    Permission.READ_ANIMAL, Permission.CREATE_ANIMAL, Permission.UPDATE_ANIMAL, Permission.DELETE_ANIMAL,
    Permission.READ_LOT, Permission.CREATE_LOT, Permission.UPDATE_LOT, Permission.DELETE_LOT,
    Permission.READ_PEN, Permission.CREATE_PEN, Permission.UPDATE_PEN, Permission.DELETE_PEN,
    Permission.READ_PEN, Permission.CREATE_PEN, Permission.UPDATE_PEN, Permission.DELETE_PEN,
    Permission.READ_BREED, Permission.CREATE_BREED, Permission.UPDATE_BREED, Permission.DELETE_BREED,
    Permission.READ_SPECIES, Permission.CREATE_SPECIES, Permission.UPDATE_SPECIES, Permission.DELETE_SPECIES,
    Permission.READ_HERD, Permission.CREATE_HERD, Permission.UPDATE_HERD, Permission.DELETE_HERD,
    Permission.READ_TREATMENT, Permission.CREATE_TREATMENT, Permission.UPDATE_TREATMENT,
    Permission.READ_VACCINATION, Permission.CREATE_VACCINATION, Permission.UPDATE_VACCINATION,
    Permission.READ_EQUIPMENT, Permission.CREATE_EQUIPMENT, Permission.UPDATE_EQUIPMENT, Permission.DELETE_EQUIPMENT,
    Permission.READ_MAINTENANCE, Permission.CREATE_MAINTENANCE, Permission.UPDATE_MAINTENANCE, Permission.DELETE_MAINTENANCE,
    Permission.READ_SALE, Permission.CREATE_SALE, Permission.UPDATE_SALE, Permission.DELETE_SALE,
    Permission.READ_EXPENSE, Permission.CREATE_EXPENSE, Permission.UPDATE_EXPENSE, Permission.DELETE_EXPENSE,
    Permission.READ_INVOICE, Permission.CREATE_INVOICE, Permission.UPDATE_INVOICE, Permission.DELETE_INVOICE,

  ],

  [Role.FARM_MANAGER]: [
    Permission.READ_FARM, Permission.CREATE_FARM, Permission.UPDATE_FARM, Permission.DELETE_FARM,
    Permission.READ_ANIMAL, Permission.CREATE_ANIMAL, Permission.UPDATE_ANIMAL, Permission.DELETE_ANIMAL,
    Permission.READ_LOT, Permission.CREATE_LOT, Permission.UPDATE_LOT, Permission.DELETE_LOT,
    Permission.READ_PRODUCTION, Permission.CREATE_PRODUCTION, Permission.UPDATE_PRODUCTION, Permission.DELETE_PRODUCTION,
    Permission.READ_FEEDSTOCK, Permission.CREATE_FEEDSTOCK, Permission.UPDATE_FEEDSTOCK, Permission.DELETE_FEEDSTOCK,
    Permission.READ_TREATMENT, Permission.CREATE_TREATMENT, Permission.UPDATE_TREATMENT,
    Permission.READ_VACCINATION, Permission.CREATE_VACCINATION, Permission.UPDATE_VACCINATION,
    Permission.READ_REPORT, Permission.CREATE_REPORT, Permission.UPDATE_REPORT, Permission.DELETE_REPORT,
    Permission.READ_FINANCIAL_REPORT, Permission.CREATE_FINANCIAL_REPORT, Permission.UPDATE_FINANCIAL_REPORT, Permission.DELETE_FINANCIAL_REPORT,
    Permission.READ_INVOICE, Permission.CREATE_INVOICE, Permission.UPDATE_INVOICE, Permission.DELETE_INVOICE,
    Permission.READ_SALE, Permission.CREATE_SALE, Permission.UPDATE_SALE, Permission.DELETE_SALE,
    Permission.READ_EXPENSE, Permission.CREATE_EXPENSE, Permission.UPDATE_EXPENSE, Permission.DELETE_EXPENSE,
    Permission.READ_EQUIPMENT, Permission.CREATE_EQUIPMENT, Permission.UPDATE_EQUIPMENT, Permission.DELETE_EQUIPMENT,
    Permission.READ_MAINTENANCE, Permission.CREATE_MAINTENANCE, Permission.UPDATE_MAINTENANCE, Permission.DELETE_MAINTENANCE,
    Permission.READ_SALE, Permission.CREATE_SALE, Permission.UPDATE_SALE, Permission.DELETE_SALE,
    Permission.READ_EXPENSE, Permission.CREATE_EXPENSE, Permission.UPDATE_EXPENSE, Permission.DELETE_EXPENSE,
    Permission.READ_INVOICE, Permission.CREATE_INVOICE, Permission.UPDATE_INVOICE, Permission.DELETE_INVOICE,

  ],

  [Role.VETERINAIRE]: [
    Permission.READ_ANIMAL,
    Permission.READ_HEALTH_RECORD, Permission.CREATE_HEALTH_RECORD, Permission.UPDATE_HEALTH_RECORD,
    Permission.READ_TREATMENT, Permission.CREATE_TREATMENT, Permission.UPDATE_TREATMENT,
    Permission.READ_VACCINATION, Permission.CREATE_VACCINATION, Permission.UPDATE_VACCINATION,
    Permission.READ_REPRODUCTION, Permission.CREATE_REPRODUCTION, Permission.UPDATE_REPRODUCTION,
    Permission.READ_ANIMAL_DEATH, Permission.CREATE_ANIMAL_DEATH, Permission.UPDATE_ANIMAL_DEATH,
    Permission.READ_ANIMAL_FEEDING,
    Permission.READ_BIRTH, Permission.CREATE_BIRTH, Permission.UPDATE_BIRTH,
    Permission.READ_WEIGHT, Permission.CREATE_WEIGHT, Permission.UPDATE_WEIGHT,
    Permission.READ_MOVEMENT,
    Permission.READ_TRANSFER,
    Permission.CREATE_ANIMAL_REPRODUCTION, Permission.UPDATE_ANIMAL_REPRODUCTION,

  
  ],

  [Role.EQUIPMENT_MANAGER]: [
    Permission.READ_EQUIPMENT, Permission.CREATE_EQUIPMENT, Permission.UPDATE_EQUIPMENT, Permission.DELETE_EQUIPMENT,
    Permission.READ_MAINTENANCE, Permission.CREATE_MAINTENANCE, Permission.UPDATE_MAINTENANCE, Permission.DELETE_MAINTENANCE,

  ],

  [Role.FINANCE_MANAGER]: [
    Permission.READ_SALE, Permission.CREATE_SALE, Permission.UPDATE_SALE, Permission.DELETE_SALE,
    Permission.READ_EXPENSE, Permission.CREATE_EXPENSE, Permission.UPDATE_EXPENSE, Permission.DELETE_EXPENSE,
    Permission.READ_FINANCIAL_REPORT, Permission.CREATE_FINANCIAL_REPORT, Permission.UPDATE_FINANCIAL_REPORT, Permission.DELETE_FINANCIAL_REPORT,
    Permission.READ_INVOICE, Permission.CREATE_INVOICE, Permission.UPDATE_INVOICE, Permission.DELETE_INVOICE,

  ],

  [Role.FERMIER]: [
    Permission.READ_ANIMAL, Permission.UPDATE_ANIMAL,Permission.CREATE_ANIMAL,
    Permission.READ_LOT,Permission.CREATE_LOT, Permission.UPDATE_LOT,
    Permission.READ_PRODUCTION, Permission.CREATE_PRODUCTION, Permission.UPDATE_PRODUCTION,
    Permission.READ_FEEDSTOCK, Permission.CREATE_FEED_USAGE, Permission.UPDATE_FEED_USAGE,
    Permission.READ_TREATMENT, Permission.READ_VACCINATION,
    Permission.READ_EQUIPMENT,Permission.READ_MAINTENANCE,
    Permission.READ_REPORT,
    Permission.READ_FINANCIAL_REPORT,
    Permission.READ_INVOICE,
    Permission.READ_SALE,Permission.CREATE_SALE, Permission.UPDATE_SALE,
    Permission.READ_EXPENSE,Permission.CREATE_EXPENSE, Permission.UPDATE_EXPENSE,
    Permission.READ_MAINTENANCE, Permission.CREATE_MAINTENANCE, Permission.UPDATE_MAINTENANCE, Permission.DELETE_MAINTENANCE,
    Permission.READ_WEIGHT, Permission.CREATE_WEIGHT, Permission.UPDATE_WEIGHT,
    Permission.READ_MOVEMENT,Permission.CREATE_MOVEMENT, Permission.UPDATE_MOVEMENT,
    Permission.READ_TRANSFER,Permission.CREATE_TRANSFER, Permission.UPDATE_TRANSFER,

  ],
};

