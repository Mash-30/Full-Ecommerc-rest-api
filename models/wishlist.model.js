import mongoose from "mongoose"

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Ensure a user has only one wishlist
wishlistSchema.index({ user: 1 }, { unique: true })

const Wishlist = mongoose.model("Wishlist", wishlistSchema)

export default Wishlist
