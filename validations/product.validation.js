import Joi from "joi"

export const productSchema = Joi.object({
  name: Joi.string().required().trim().min(3).max(100),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  compareAtPrice: Joi.number().min(0),
  category: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/),
  subcategory: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  variants: Joi.array().items(
    Joi.object({
      size: Joi.string(),
      color: Joi.string(),
      weight: Joi.number(),
      price: Joi.number().required().min(0),
      stock: Joi.number().required().min(0),
      sku: Joi.string().required(),
    }),
  ),
  attributes: Joi.object().pattern(Joi.string(), Joi.string()),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().required(),
      alt: Joi.string(),
      isDefault: Joi.boolean().default(false),
    }),
  ),
  stock: Joi.number().required().min(0),
  sku: Joi.string().required(),
  barcode: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  featured: Joi.boolean(),
  status: Joi.string().valid("draft", "active", "archived"),
})
