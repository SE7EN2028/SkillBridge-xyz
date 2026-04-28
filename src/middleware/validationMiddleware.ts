import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ObjectSchema } from 'joi';
import { ValidationError } from '../utils/appError';

export const validate = (schema: ObjectSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors: Record<string, string> = {};
      error.details.forEach((detail) => {
        const key = detail.path.join('.');
        errors[key] = detail.message;
      });
      next(new ValidationError(errors));
      return;
    }
    req.body = value;
    next();
  };
};