import { AnimalStatus, Gender } from "../../generated/prisma/enums.js";

export interface Animal {
  id: number;
  name: string;
  farmId: number;
  lotId?: number;
  speciesId: number;
  breedId?: number;
  barnId?: number;
  penId:number;
  herdId:number;
  photo?: string;
  birthId?: number;
  qrcode?: string;
  gender?: Gender;
  birthDate?: string; // ISO string
  weight?: number;
  status?: AnimalStatus;
  createdAt?: string;
  updatedAt?: string;
}


