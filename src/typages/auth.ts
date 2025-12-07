import {Role} from './role.js';
import { UserStatus } from '../../generated/prisma/enums.js';

export interface RegisterUser {
    id: number;
    name: string;
    password:string;
    userName:string;
    phone:string;
    email: string;
    passwordConfirmation: string;  
    photo: string;
    otp?: string;
    userRole: string;
    status: string;
};


export interface AuthenticatedRequest extends Request {
    user?: {
      id: number;
      name?: string;
      email: string;
      userRoles?: Role[];
      status?: string;
    };
  }
  export interface ResetPassword {
    email: string;
  };
  export interface LoginUser {
    email: string;
    password: string;
  };