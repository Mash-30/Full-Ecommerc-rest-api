import mongoose from "mongoose"

const productVariantSchema = new mongoose.Schema({
  size: String,
  color: String,
  weight: Number,
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  sku: {
    type: String,
    required: true,
  },
})

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    compareAtPrice: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    variants: [productVariantSchema],
    attributes: {
      type: Map,
      of: String,
    },
    images: [
      {
        url: String,
        alt: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    barcode: String,
    tags: [String],
    featured: {
      type: Boolean,
      default: false,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
)

// Add text index for search
productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
})

const Product = mongoose.model("Product", productSchema)

export default Product
