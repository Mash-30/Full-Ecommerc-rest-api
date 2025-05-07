import Joi from "joi"

const addressSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().required(),
  phone: Joi.string(),
})

export const createOrderSchema = Joi.object({
  shippingAddress: addressSchema.required(),
  billingAddress: addressSchema.required(),
  paymentMethod: Joi.string().required(),
  shippingMethod: Joi.string().required(),
  notes: Joi.string(),
  email: Joi.string().email().when("$user", {
    is: null,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  sessionId: Joi.string().when("$user", {
    is: null,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
})

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().required().valid("pending", "processing", "shipped", "delivered", "cancelled", "refunded"),
  note: Joi.string(),
})
