export interface User {
  id: number;
  name: string;
  password: string;
  email: string;
  onboardingComplete: boolean;
  photo: string;
  userRole: string;
  status: string;
  defaultFarmId?: number;
  defaultOrganizationId?: number;
}
