import express from "express"
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getRelatedProducts,
} from "../controllers/product.controller.js"
import { authenticate, authorize } from "../middleware/auth.middleware.js"
import { validateRequest } from "../middleware/validation.middleware.js"
import { productSchema } from "../validations/product.validation.js"

const router = express.Router()

// Public routes
router.get("/", getProducts)
router.get("/search", searchProducts)
router.get("/:id", getProductById)
router.get("/:id/related", getRelatedProducts)

// Protected routes (admin only)
router.post("/", authenticate, authorize("admin"), validateRequest(productSchema), createProduct)

router.put("/:id", authenticate, authorize("admin"), validateRequest(productSchema), updateProduct)

router.delete("/:id", authenticate, authorize("admin"), deleteProduct)

export default router
