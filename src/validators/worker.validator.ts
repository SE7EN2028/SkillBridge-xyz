import Joi from 'joi';

export const createWorkerProfileSchema = Joi.object({
  city: Joi.string().min(2).max(100).required(),
  bio: Joi.string().max(500).optional(),
  hourlyRate: Joi.number().min(0).max(10000).required(),
});

export const updateWorkerProfileSchema = Joi.object({
  city: Joi.string().min(2).max(100).optional(),
  bio: Joi.string().max(500).optional().allow(''),
  hourlyRate: Joi.number().min(0).max(10000).optional(),
  isAvailable: Joi.boolean().optional(),
});

export const addSkillSchema = Joi.object({
  skillName: Joi.string().min(2).max(100).required(),
  yearsExp: Joi.number().integer().min(0).max(50).required(),
  certificateUrl: Joi.string().uri().optional(),
});
