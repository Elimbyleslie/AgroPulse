// ============================================
// Lot Interfaces
// ============================================

export enum LotStatus {
  ACTIVE = "active",
  CLOSED = "closed",
}

export enum AgeGroup {
  YOUNG = "young",
  ADULT = "adult",
  BREEDING = "breeding",
  FATTENING = "fattening",
  MIXED = "mixed",
}

// Interface de base pour Lot (données DB brutes)
export interface Lot {
  id: number;
  farmId: number;
  herdId: number | null;
  barnId: number | null;
  penId: number | null;
  name: string;
  photo: string | null;
  speciesId: number | null;
  breedId: number | null;
  ageGroup: AgeGroup | null;
  quantity: number;
  entryDate: string | null;
  status: LotStatus;
}

// Interface pour la création d'un Lot
export interface ICreateLot {
  farmId: number;
  name: string;
  herdId?: number | null;
  barnId?: number | null;
  penId?: number | null;
  speciesId?: number | null;
  breedId?: number | null;
  ageGroup?: AgeGroup | null;
  quantity?: number;
  entryDate?: Date | string | null;
  status?: LotStatus;
  photo?: string | null;
}

// Interface pour la mise à jour d'un Lot
export interface IUpdateLot {
  name?: string;
  herdId?: number | null;
  barnId?: number | null;
  penId?: number | null;
  speciesId?: number | null;
  breedId?: number | null;
  ageGroup?: AgeGroup | null;
  quantity?: number;
  entryDate?: Date | string | null;
  status?: LotStatus;
  photo?: string | null;
}

// Interface pour Lot avec relations complètes
export interface ILotWithRelations extends Lot {
  farm?: {
    id: number;
    name: string;
  };
  herd?: {
    id: number;
    name: string;
  } | null;
  barn?: {
    id: number;
    name: string;
  } | null;
  pen?: {
    id: number;
    name: string;
  } | null;
  species?: {
    id: number;
    name: string;
  } | null;
  breed?: {
    id: number;
    name: string;
  } | null;
  _count?: {
    animals?: number;
    healthRecords?: number;
    vaccinations?: number;
    treatments?: number;
  };
}

// Interface pour les filtres de requête
export interface ILotFilters {
  search?: string;
  farmId?: number;
  herdId?: number;
  barnId?: number;
  penId?: number;
  speciesId?: number;
  status?: LotStatus;
  ageGroup?: AgeGroup;
  page?: number;
  limit?: number;
}

// Interface pour la réponse paginée
export interface ILotPaginatedResponse {
  lots: ILotWithRelations[];
  pagination: {
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
    totalItems: number;
    totalPage: number;
  };
}