import Joi from "joi"

export const registerSchema = Joi.object({
  firstName: Joi.string().required().trim().min(2).max(50),
  lastName: Joi.string().required().trim().min(2).max(50),
  email: Joi.string().required().email(),
  password: Joi.string()
    .required()
    .min(8)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
    .message("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
})

export const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
})

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().required().email(),
})

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .required()
    .min(8)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
    .message("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
})
