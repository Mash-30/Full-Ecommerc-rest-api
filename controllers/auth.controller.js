import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/user.model.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { sendEmail } from "../utils/email.js"

// Register a new user
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists")
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      verificationToken,
    })

    await user.save()

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
    })

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" })

    // Remove sensitive data
    const userWithoutPassword = { ...user.toObject() }
    delete userWithoutPassword.password
    delete userWithoutPassword.verificationToken

    return res
      .status(201)
      .json(new ApiResponse(201, { user: userWithoutPassword, token }, "User registered successfully"))
  } catch (error) {
    next(error)
  }
}

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      throw new ApiError(401, "Invalid email or password")
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password")
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new ApiError(403, "Your account is not active")
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" })

    // Remove sensitive data
    const userWithoutPassword = { ...user.toObject() }
    delete userWithoutPassword.password
    delete userWithoutPassword.verificationToken
    delete userWithoutPassword.resetPasswordToken
    delete userWithoutPassword.resetPasswordExpires

    return res.status(200).json(new ApiResponse(200, { user: userWithoutPassword, token }, "Login successful"))
  } catch (error) {
    next(error)
  }
}

// Verify email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params

    const user = await User.findOne({ verificationToken: token })
    if (!user) {
      throw new ApiError(400, "Invalid or expired verification token")
    }

    user.isEmailVerified = true
    user.verificationToken = undefined
    await user.save()

    return res.status(200).json(new ApiResponse(200, null, "Email verified successfully"))
  } catch (error) {
    next(error)
  }
}

// Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal that the user doesn't exist
      return res
        .status(200)
        .json(new ApiResponse(200, null, "If your email is registered, you will receive a password reset link"))
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save()

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      text: `Please reset your password by clicking on the following link: ${resetUrl}. This link is valid for 1 hour.`,
    })

    return res
      .status(200)
      .json(new ApiResponse(200, null, "If your email is registered, you will receive a password reset link"))
  } catch (error) {
    next(error)
  }
}

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      throw new ApiError(400, "Invalid or expired reset token")
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return res.status(200).json(new ApiResponse(200, null, "Password reset successful"))
  } catch (error) {
    next(error)
  }
}

// Get current user
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpires",
    )

    if (!user) {
      throw new ApiError(404, "User not found")
    }

    return res.status(200).json(new ApiResponse(200, user, "User retrieved successfully"))
  } catch (error) {
    next(error)
  }
}
