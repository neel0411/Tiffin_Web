import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQty,
  clearCart,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ➕ Add item to cart
router.post("/", authMiddleware, addToCart);

// 🛒 Get user's cart
router.get("/", authMiddleware, getCart);

// ❌ Remove single item from cart - FIXED ROUTE
router.delete("/:id", authMiddleware, removeFromCart); // Changed from "/item/:id" to "/:id"

// 🔄 Update quantity
router.put("/", authMiddleware, updateCartQty);

// 🗑️ Clear entire cart
router.delete("/clear/all", authMiddleware, clearCart);

export default router;