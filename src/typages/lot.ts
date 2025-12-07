import { LotStatus } from '../../generated/prisma/enums.js'; // Enum Prisma pour le status

export interface Lot {
  id: number;          
  herdId?: number ;
  farmId: number;
  barnId?: number ;
  name: string;
  photo?: string ;
  speciesId: number ;
  breedId: number ;
  ageGroup: string;
  quantity: number;     
  entryDate: Date ;
  status: LotStatus;    

}