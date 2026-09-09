export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  ORGANIZATION_OWNER = "ORGANIZATION_OWNER",
  FARM_MANAGER = "FARM_MANAGER",
  VETERINAIRE = "VETERINAIRE",
  EQUIPMENT_MANAGER = "EQUIPMENT_MANAGER",
  FINANCE_MANAGER = "FINANCE_MANAGER ",
  FERMIER = " FERMIER ",
}

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
