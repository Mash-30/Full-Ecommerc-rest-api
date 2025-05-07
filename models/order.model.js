import mongoose from "mongoose"

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: {
    type: Number,
    required: true,
  },
})

const orderAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: String,
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: String,
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    billingAddress: orderAddressSchema,
    shippingAddress: orderAddressSchema,
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentId: String,
    shippingMethod: {
      type: String,
      required: true,
    },
    shippingTrackingNumber: String,
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
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
      required: true,
    },
    notes: String,
    appliedCoupons: [
      {
        code: String,
        discount: Number,
      },
    ],
    invoiceUrl: String,
  },
  {
    timestamps: true,
  },
)

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")

    // Find the latest order to increment the sequence
    const latestOrder = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } })
    let sequence = 1

    if (latestOrder && latestOrder.orderNumber) {
      const latestSequence = Number.parseInt(latestOrder.orderNumber.split("-")[1])
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1
      }
    }

    this.orderNumber = `${year}${month}${day}-${sequence.toString().padStart(4, "0")}`
  }
  next()
})

const Order = mongoose.model("Order", orderSchema)

export default Order
