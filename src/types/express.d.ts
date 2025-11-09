import { User } from "@prisma/client";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: number;
        email: string;
        name?: string;
        userRoles?: number[];
        status?: string;
      };
    }
  }

  export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
}
