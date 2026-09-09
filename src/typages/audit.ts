// types/Audit.ts
export interface Audit {
  id: number;
  userId?: number | null;
  organizationId?: number | null;
  farmId?: number | null;
  tableTarget: string;
  action: string;
  recordId?: number | null;
  description?: string | null;
  previousData?: any | null;
  newData?: any | null;  
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  user?: any;
  farm?: any;
  organization?: any;
}



// types/ActivityLog.ts
export interface ActivityLog {
  id: number;
  userId?: number | null;
  action?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  createdAt: Date;

  user?: any;
}
