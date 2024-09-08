import Joi from "joi";

export const createProjectSchema = Joi.object({
  name: Joi.string().required().min(3),
  description: Joi.string().optional().allow(''),
  assignedTo: Joi.array().items(Joi.string().uuid()).optional(),
});
