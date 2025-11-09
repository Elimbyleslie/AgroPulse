import { AnySchema } from 'yup';
import Utilities from '../helpers/utilities.js';
import { KeyType, Verify } from 'node:crypto';
import { NextFunction, Request, RequestParamHandler, Response } from 'express';

export const validator = (schema: AnySchema) => {
  return async (req: Request, res: any, next: NextFunction): Promise<void> => {
    try {
      await schema.validate(
        { ...req.body, ...req.query, ...req.params },
        {
          strict: true,
          abortEarly: false,
        },
      );
      next();
    } catch (error: any) {
      return res.status(422).json({
        message: 'Validation failed !!!',
        errors: Utilities.formatValidationErrors(error),
      });
    }
  };
};
