import { ApiError } from "../utils/api-error.js"

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  // Default error
  let statusCode = 500
  let message = "Internal Server Error"
  let errors = null

  // Handle mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400
    message = "Validation Error"
    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }))
  }

  // Handle mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409
    message = "Duplicate Key Error"
    const field = Object.keys(err.keyValue)[0]
    errors = [
      {
        field,
        message: `${field} already exists`,
      },
    ]
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode
    message = err.message
    errors = err.errors
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
}
