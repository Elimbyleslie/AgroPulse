
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ORGANIZATION_OWNER='organization_owner',
  FARM_MANAGER = 'farm_manager',
  VETERINAIRE = 'veterinaire',
  EQUIPMENT_MANAGER = 'equipement_manager',
  FINANCE_MANAGER='finance_manager',
  FERMIER='fermier'
}

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
