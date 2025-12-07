export interface Birth {
  id?: number;
  farmId: number;
  lotId?: number;
  motherId: number;
  fatherId?: number;
  photo?: string;
  date: string; // ISO string
  numberBorn?: number;
  numberAlive?: number;
  numberDead?: number;
  notes?: string;
  userId?: number;
  createdAt?: string;
}

