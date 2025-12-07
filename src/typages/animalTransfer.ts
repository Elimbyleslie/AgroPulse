export interface AnimalTransfer {
  id?: number;
  animalId: number;
  fromLotId?: number;
  toLotId?: number;
  date: Date;
  userId?: number;
}