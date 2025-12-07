import { SubscriptionStatus,RenewalType } from "../../generated/prisma/enums";

export interface Subscription{
    id: number;
    organizationId: number;
    planId: number;
    startDate: Date;
    endDate: Date;
    renewalType: RenewalType;
    status: SubscriptionStatus;
}