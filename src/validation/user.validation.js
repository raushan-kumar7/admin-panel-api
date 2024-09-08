import Joi from "joi";

const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("Admin", "Manager", "Employee").required(),
});

const loginUserSchema = Joi.object({
  usernameOrEmail: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

const roleSchema = Joi.object({
  role: Joi.string().valid("Admin", "Manager", "Employee").required(),
});

export { createUserSchema, loginUserSchema, roleSchema };
