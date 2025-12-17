export {};

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name?: string;
      status?: string;
      roles: string[];
     
    }
  }
}
