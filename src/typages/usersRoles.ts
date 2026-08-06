// typages/rbac.ts

export interface Role {
  id?: number;
  name: string;
  description?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  permissions?: Permission[];
  users?: UserRole[];
}

export interface Permission {
  id?: number;
  code: string;
  description: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserRole {
  userId: number;
  roleId: number;
  assignedBy: string;
  assignedAt?: string | Date;
  user?: any;
  role?: Role;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
  role?: Role;
  permission?: Permission;
}

// Payloads utiles
export type CreateRolePayload = {
  name: string;
  description?: string;
  permissionIds?: number[]; // optionnel : assigner dès la création
};

export type UpdateRolePayload = {
  name?: string;
  description?: string;
  permissionIds?: number[]; // remplace la liste des permissions
};

export type AssignRolePayload = {
  userId: number;
  roleId: number;
  assignedBy: string;
};

export type AssignPermissionPayload = {
  roleId: number;
  permissionId: number;
};