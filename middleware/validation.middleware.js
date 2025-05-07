import { ApiError } from "../utils/api-error.js"

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      context: {
        user: req.user,
      },
    })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }))

      return next(new ApiError(400, "Validation Error", errors))
    }

    next()
  }
}
