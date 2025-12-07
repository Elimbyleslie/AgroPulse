import env from '../config/env.js';
import { NextFunction, Request, Response } from 'express';

const credentials = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.origin && env.allowOrigins.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
  next();
};

export default credentials;
