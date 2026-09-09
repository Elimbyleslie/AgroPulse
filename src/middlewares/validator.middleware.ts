import { AnySchema } from "yup";
import Utilities from "../helpers/utilities.js";
import { KeyType, Verify } from "node:crypto";
import { NextFunction, Request, RequestParamHandler, Response } from "express";

// Dans ton middleware de validation (ex: validate.ts)
export const validator = (schema: any) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // L'option { cast: true } est CRUCIALE ici
    const validatedBody = await schema.validate(req.body, { 
      abortEarly: false, 
      stripUnknown: true 
    });
    
    // TRÈS IMPORTANT : On remplace req.body par la version castée (avec les vrais nombres)
    req.body = validatedBody; 
    
    next();
  } catch (error: any) {
    return res.status(400).json({
      message: "Validation failed !!!",
      errors: error.inner.reduce((acc: any, curr: any) => ({
        ...acc,
        [curr.path]: curr.message
      }), {})
    });
  }
};