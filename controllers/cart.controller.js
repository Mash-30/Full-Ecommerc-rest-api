import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"

// Get cart
export const getCart = async (req, res, next) => {
  try {
    let cart

    if (req.user) {
      // Logged in user
      cart = await Cart.findOne({ user: req.user.id }).populate({
        path: "items.product",
        select: "name price images stock",
      })
    } else if (req.body.sessionId) {
      // Guest user with session ID
      cart = await Cart.findOne({ sessionId: req.body.sessionId }).populate({
        path: "items.product",
        select: "name price images stock",
      })
    }

    if (!cart) {
      return res.status(200).json(new ApiResponse(200, { items: [], subtotal: 0, grandTotal: 0 }, "Cart is empty"))
    }

    return res.status(200).json(new ApiResponse(200, cart, "Cart retrieved successfully"))
  } catch (error) {
    next(error)
  }
}

// Add item to cart
export const addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity, sessionId } = req.body

    // Validate product
    const product = await Product.findById(productId)
    if (!product) {
      throw new ApiError(404, "Product not found")
    }

    // Check stock
    if (product.stock < quantity) {
      throw new ApiError(400, "Not enough stock available")
    }

    let cart
    const query = {}

    if (req.user) {
      query.user = req.user.id
    } else if (sessionId) {
      query.sessionId = sessionId
    } else {
      throw new ApiError(400, "Session ID is required for guest cart")
    }

    // Find or create cart
    cart = await Cart.findOne(query)

    if (!cart) {
      cart = new Cart({
        ...(req.user ? { user: req.user.id } : { sessionId }),
        items: [],
      })
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && (!variantId || item.variant?.toString() === variantId),
    )

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price: product.price,
      })
    }

    // Recalculate cart totals
    cart.recalculateTotals()
    await cart.save()

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images stock",
    })

    return res.status(200).json(new ApiResponse(200, cart, "Item added to cart successfully"))
  } catch (error) {
    next(error)
  }
}

// Update cart item
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId, quantity, savedForLater } = req.body

    const query = {}
    if (req.user) {
      query.user = req.user.id
    } else if (req.body.sessionId) {
      query.sessionId = req.body.sessionId
    } else {
      throw new ApiError(400, "Session ID is required for guest cart")
    }

    const cart = await Cart.findOne(query)

    if (!cart) {
      throw new ApiError(404, "Cart not found")
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId)

    if (itemIndex === -1) {
      throw new ApiError(404, "Item not found in cart")
    }

    // Update quantity if provided
    if (quantity !== undefined) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1)
      } else {
        // Check stock
        const product = await Product.findById(cart.items[itemIndex].product)
        if (!product || product.stock < quantity) {
          throw new ApiError(400, "Not enough stock available")
        }

        cart.items[itemIndex].quantity = quantity
      }
    }

    // Update savedForLater if provided
    if (savedForLater !== undefined) {
      cart.items[itemIndex].savedForLater = savedForLater
    }

    // Recalculate cart totals
    cart.recalculateTotals()
    await cart.save()

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images stock",
    })

    return res.status(200).json(new ApiResponse(200, cart, "Cart updated successfully"))
  } catch (error) {
    next(error)
  }
}

// Remove item from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params

    const query = {}
    if (req.user) {
      query.user = req.user.id
    } else if (req.query.sessionId) {
      query.sessionId = req.query.sessionId
    } else {
      throw new ApiError(400, "Session ID is required for guest cart")
    }

    const cart = await Cart.findOne(query)

    if (!cart) {
      throw new ApiError(404, "Cart not found")
    }

    // Remove item from cart
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId)

    // Recalculate cart totals
    cart.recalculateTotals()
    await cart.save()

    return res.status(200).json(new ApiResponse(200, cart, "Item removed from cart successfully"))
  } catch (error) {
    next(error)
  }
}

// Clear cart
export const clearCart = async (req, res, next) => {
  try {
    const query = {}
    if (req.user) {
      query.user = req.user.id
    } else if (req.query.sessionId) {
      query.sessionId = req.query.sessionId
    } else {
      throw new ApiError(400, "Session ID is required for guest cart")
    }

    const cart = await Cart.findOne(query)

    if (!cart) {
      throw new ApiError(404, "Cart not found")
    }

    cart.items = []
    cart.appliedCoupons = []
    cart.subtotal = 0
    cart.discountTotal = 0
    cart.taxTotal = 0
    cart.shippingTotal = 0
    cart.grandTotal = 0

    await cart.save()

    return res.status(200).json(new ApiResponse(200, cart, "Cart cleared successfully"))
  } catch (error) {
    next(error)
  }
}
