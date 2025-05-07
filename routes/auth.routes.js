import express from "express"
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from "../controllers/auth.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"
import { validateRequest } from "../middleware/validation.middleware.js"
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation.js"

const router = express.Router()

// Public routes
router.post("/register", validateRequest(registerSchema), register)
router.post("/login", validateRequest(loginSchema), login)
router.get("/verify-email/:token", verifyEmail)
router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword)
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword)

// Protected routes
router.get("/me", authenticate, getCurrentUser)

export default router
