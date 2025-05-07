import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js"
import User from "../models/user.model.js"

// Authenticate middleware
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null

    if (!token) {
      throw new ApiError(401, "Authentication required")
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user
    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      throw new ApiError(401, "Invalid token")
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new ApiError(403, "Your account is not active")
    }

    // Set user in request
    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token"))
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"))
    }
    next(error)
  }
}

// Optional authentication middleware
export const optionalAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null

    if (!token) {
      return next()
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user
    const user = await User.findById(decoded.id).select("-password")
    if (user && user.status === "active") {
      req.user = user
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

// Authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"))
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You are not authorized to perform this action"))
    }

    next()
  }
}
