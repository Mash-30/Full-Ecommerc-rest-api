import express from "express"
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cart.controller.js"
import { optionalAuth } from "../middleware/auth.middleware.js"
import { validateRequest } from "../middleware/validation.middleware.js"
import { addToCartSchema, updateCartItemSchema } from "../validations/cart.validation.js"

const router = express.Router()

// All routes use optionalAuth to handle both logged in and guest users
router.get("/", optionalAuth, getCart)
router.post("/", optionalAuth, validateRequest(addToCartSchema), addToCart)
router.put("/items", optionalAuth, validateRequest(updateCartItemSchema), updateCartItem)
router.delete("/items/:itemId", optionalAuth, removeFromCart)
router.delete("/", optionalAuth, clearCart)

export default router
