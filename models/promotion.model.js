import mongoose from "mongoose"

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping", "buy_x_get_y"],
      required: true,
    },
    value: {
      type: Number,
      required: function () {
        return ["percentage", "fixed"].includes(this.type)
      },
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    maxDiscount: Number,
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      perUser: {
        type: Number,
        default: null,
      },
      total: {
        type: Number,
        default: null,
      },
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    applicableTo: {
      products: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      categories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      customerGroups: [
        {
          type: String,
          enum: ["regular", "vip", "wholesale"],
        },
      ],
    },
    conditions: {
      buyX: {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
      getY: {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        discount: Number, // percentage discount on Y
      },
    },
  },
  {
    timestamps: true,
  },
)

// Check if promotion is valid
promotionSchema.methods.isValid = function (currentDate = new Date()) {
  return (
    this.isActive &&
    currentDate >= this.startDate &&
    currentDate <= this.endDate &&
    (this.usageLimit.total === null || this.usageCount < this.usageLimit.total)
  )
}

const Promotion = mongoose.model("Promotion", promotionSchema)

export default Promotion
