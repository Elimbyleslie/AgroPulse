export interface FarmUser {
  id: number;
  farmId: number;
  userId: number;
  farm?: any; 
  user?: any;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string | Date;
}

export  interface ActivityLog {
    id: number;
    userId: number;
    action: string;
    description: string;
    createdAt?: string | Date;
    ipAddress?: string;
  }
 