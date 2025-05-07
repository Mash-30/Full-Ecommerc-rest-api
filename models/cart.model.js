import mongoose from "mongoose"

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  savedForLater: {
    type: Boolean,
    default: false,
  },
})

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
      sparse: true,
    },
    items: [cartItemSchema],
    appliedCoupons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promotion",
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
    },
    taxTotal: {
      type: Number,
      default: 0,
    },
    shippingTotal: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index to ensure a user has only one active cart
cartSchema.index({ user: 1 }, { unique: true, sparse: true })
cartSchema.index({ sessionId: 1 }, { unique: true, sparse: true })

// Method to recalculate cart totals
cartSchema.methods.recalculateTotals = function () {
  this.subtotal = this.items.reduce((total, item) => {
    if (!item.savedForLater) {
      return total + item.price * item.quantity
    }
    return total
  }, 0)

  // Calculate grand total (subtotal - discounts + tax + shipping)
  this.grandTotal = this.subtotal - this.discountTotal + this.taxTotal + this.shippingTotal

  return this
}

const Cart = mongoose.model("Cart", cartSchema)

export default Cart
