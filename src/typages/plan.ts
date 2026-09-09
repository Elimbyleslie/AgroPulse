import { Subscription } from "./subscription";

export interface Plan {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly?: number | null;
  currency: string;
  maxFarms?: number | null;
  maxUsers?: number | null;
  maxAnimals?: number | null;
  features?: Record<string, unknown> | null;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;

  subscriptions?: Subscription[];
}
