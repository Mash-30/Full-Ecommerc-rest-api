import Joi from "joi"

export const addToCartSchema = Joi.object({
  productId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/),
  variantId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  quantity: Joi.number().required().min(1),
  sessionId: Joi.string().when("$user", {
    is: null,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
}).with("sessionId", ["productId", "quantity"])

export const updateCartItemSchema = Joi.object({
  itemId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/),
  quantity: Joi.number().min(0),
  savedForLater: Joi.boolean(),
  sessionId: Joi.string().when("$user", {
    is: null,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
})
