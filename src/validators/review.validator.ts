import Joi from 'joi';

export const createReviewSchema = Joi.object({
  applicationId: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional(),
});