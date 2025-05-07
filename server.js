import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import productRoutes from "./routes/product.routes.js"
import categoryRoutes from "./routes/category.routes.js"
import userRoutes from "./routes/user.routes.js"
import authRoutes from "./routes/auth.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import orderRoutes from "./routes/order.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import promotionRoutes from "./routes/promotion.routes.js"
import wishlistRoutes from "./routes/wishlist.routes.js"
import { errorHandler } from "./middleware/error.middleware.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/promotions", promotionRoutes)
app.use("/api/wishlist", wishlistRoutes)

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to E-Commerce API" })
})

// Error handling middleware
app.use(errorHandler)

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err)
    process.exit(1)
  })

export default app
