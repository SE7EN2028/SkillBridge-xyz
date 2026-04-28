import Joi from 'joi';

export const createJobSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(2000).optional(),
  skillRequired: Joi.string().min(2).max(100).required(),
  city: Joi.string().min(2).max(100).required(),
  budget: Joi.number().min(0).max(100000).required(),
});

export const applyToJobSchema = Joi.object({
  coverNote: Joi.string().max(500).optional(),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('ACCEPTED', 'REJECTED', 'COMPLETED').required(),
});