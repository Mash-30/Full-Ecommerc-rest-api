import express from "express"
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/order.controller.js"
import { authenticate, authorize, optionalAuth } from "../middleware/auth.middleware.js"
import { validateRequest } from "../middleware/validation.middleware.js"
import { createOrderSchema, updateOrderStatusSchema } from "../validations/order.validation.js"

const router = express.Router()

// Create order (works for both logged in and guest users)
router.post("/", optionalAuth, validateRequest(createOrderSchema), createOrder)

// Get user orders (requires authentication)
router.get("/", authenticate, getUserOrders)
router.get("/:id", authenticate, getOrderById)

// Cancel order (requires authentication)
router.post("/:id/cancel", authenticate, cancelOrder)

// Admin routes
router.put("/:id/status", authenticate, authorize("admin"), validateRequest(updateOrderStatusSchema), updateOrderStatus)

export default router
