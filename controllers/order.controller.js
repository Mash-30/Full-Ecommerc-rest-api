import Order from "../models/order.model.js"
import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"

// Create order
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, shippingMethod, notes, sessionId } = req.body

    // Find user's cart
    const query = {}
    if (req.user) {
      query.user = req.user.id
    } else if (sessionId) {
      query.sessionId = sessionId
    } else {
      throw new ApiError(400, "Session ID is required for guest checkout")
    }

    const cart = await Cart.findOne(query).populate("items.product")

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty")
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.product)
      if (!product || product.stock < item.quantity) {
        throw new ApiError(400, `Not enough stock for ${product ? product.name : "a product"}`)
      }
    }

    // Create order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      variant: item.variant,
      name: item.product.name,
      sku: item.product.sku,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    // Create new order
    const order = new Order({
      user: req.user ? req.user.id : null,
      email: req.user ? req.user.email : req.body.email,
      items: orderItems,
      billingAddress,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      subtotal: cart.subtotal,
      discountTotal: cart.discountTotal,
      taxTotal: cart.taxTotal,
      shippingTotal: cart.shippingTotal,
      grandTotal: cart.grandTotal,
      notes,
      appliedCoupons: cart.appliedCoupons.map((coupon) => ({
        code: coupon.code,
        discount: coupon.value,
      })),
      statusHistory: [
        {
          status: "pending",
          note: "Order created",
        },
      ],
    })

    await order.save()

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      })
    }

    // Clear cart
    cart.items = []
    cart.appliedCoupons = []
    cart.subtotal = 0
    cart.discountTotal = 0
    cart.taxTotal = 0
    cart.shippingTotal = 0
    cart.grandTotal = 0
    await cart.save()

    return res.status(201).json(new ApiResponse(201, order, "Order created successfully"))
  } catch (error) {
    next(error)
  }
}

// Get orders for current user
export const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const total = await Order.countDocuments({ user: req.user.id })

    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select("orderNumber status grandTotal createdAt items")

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orders,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
          },
        },
        "Orders retrieved successfully",
      ),
    )
  } catch (error) {
    next(error)
  }
}

// Get order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params

    const order = await Order.findById(id)

    if (!order) {
      throw new ApiError(404, "Order not found")
    }

    // Check if the order belongs to the current user (unless admin)
    if (req.user.role !== "admin" && order.user && order.user.toString() !== req.user.id) {
      throw new ApiError(403, "You are not authorized to view this order")
    }

    return res.status(200).json(new ApiResponse(200, order, "Order retrieved successfully"))
  } catch (error) {
    next(error)
  }
}

// Update order status (admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, note } = req.body

    const order = await Order.findById(id)

    if (!order) {
      throw new ApiError(404, "Order not found")
    }

    order.status = status
    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status}`,
    })

    await order.save()

    return res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"))
  } catch (error) {
    next(error)
  }
}

// Cancel order
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const order = await Order.findById(id)

    if (!order) {
      throw new ApiError(404, "Order not found")
    }

    // Check if the order belongs to the current user (unless admin)
    if (req.user.role !== "admin" && order.user && order.user.toString() !== req.user.id) {
      throw new ApiError(403, "You are not authorized to cancel this order")
    }

    // Check if order can be cancelled
    if (!["pending", "processing"].includes(order.status)) {
      throw new ApiError(400, "This order cannot be cancelled")
    }

    order.status = "cancelled"
    order.statusHistory.push({
      status: "cancelled",
      note: reason || "Order cancelled by user",
    })

    await order.save()

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      })
    }

    return res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"))
  } catch (error) {
    next(error)
  }
}
