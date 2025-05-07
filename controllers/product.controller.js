import Product from "../models/product.model.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"

// Get all products with pagination and filtering
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      category,
      minPrice,
      maxPrice,
      search,
      featured,
      status = "active",
    } = req.query

    const query = { status }

    // Apply filters
    if (category) query.category = category
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }
    if (featured) query.featured = featured === "true"
    if (search) query.$text = { $search: search }

    // Count total documents
    const total = await Product.countDocuments(query)

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("category", "name slug")

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          products,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
          },
        },
        "Products retrieved successfully",
      ),
    )
  } catch (error) {
    next(error)
  }
}

// Get product by ID
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")

    if (!product) {
      throw new ApiError(404, "Product not found")
    }

    return res.status(200).json(new ApiResponse(200, product, "Product retrieved successfully"))
  } catch (error) {
    next(error)
  }
}

// Create new product
export const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body)
    await product.save()

    return res.status(201).json(new ApiResponse(201, product, "Product created successfully"))
  } catch (error) {
    next(error)
  }
}

// Update product
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!product) {
      throw new ApiError(404, "Product not found")
    }

    return res.status(200).json(new ApiResponse(200, product, "Product updated successfully"))
  } catch (error) {
    next(error)
  }
}

// Delete product
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      throw new ApiError(404, "Product not found")
    }

    return res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"))
  } catch (error) {
    next(error)
  }
}

// Search products
export const searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query

    if (!q) {
      throw new ApiError(400, "Search query is required")
    }

    const products = await Product.find({ $text: { $search: q }, status: "active" }, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(Number(limit))
      .select("name price images category")

    return res.status(200).json(new ApiResponse(200, products, "Search results retrieved successfully"))
  } catch (error) {
    next(error)
  }
}

// Get related products
export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      throw new ApiError(404, "Product not found")
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: "active",
    })
      .limit(4)
      .select("name price images")

    return res.status(200).json(new ApiResponse(200, relatedProducts, "Related products retrieved successfully"))
  } catch (error) {
    next(error)
  }
}
