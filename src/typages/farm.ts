export interface Farm {
  id: number;
  name: string;
  organizationId: number;
  managerId: number;
  location: string;
  areaUnit: string;
  area: number;
  photo?: string;
  createdAt: Date;
  updatedAt?: Date;
}
