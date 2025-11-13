// routes/orderRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import {
  createOrder,
  addOrderItem,
  addMultipleOrderItems,
  getCustomerOrders,
  getSupplierOrders,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getOrderDetails,
  getSupplierDashboardStats,
    getAdminOrders, // ✅ YE IMPORT KARO
  updateAdminOrderStatus // ✅ YE BHI IMPORT KARO
} from "../controllers/orderController.js";

const router = express.Router();

// ➕ Create new order
router.post("/", authMiddleware, createOrder);

// ➕ Add order item
router.post("/items", authMiddleware, addOrderItem);

// ➕ Add multiple order items
router.post("/items/multiple", authMiddleware, addMultipleOrderItems);

// 📦 Get orders for customer
router.get("/", authMiddleware, getCustomerOrders);

// 📦 Get orders for supplier
router.get("/supplier", authMiddleware, getSupplierOrders);

// 📊 Get supplier dashboard stats
router.get("/supplier/stats", authMiddleware, getSupplierDashboardStats);

// 📋 Get order details
router.get("/:id", authMiddleware, getOrderDetails);

// 🔄 Update order status
router.patch("/:id/status", authMiddleware, updateOrderStatus);

// 🔄 Update payment status
router.patch("/:order_id/payment", authMiddleware, updatePaymentStatus);

// 🗑️ Delete order
router.delete("/:id", authMiddleware, deleteOrder);


// 📦 Get all orders (admin only)
router.get("/admin/all", authMiddleware, roleMiddleware(["admin"]), getAdminOrders);


// 🔄 Update order status (admin only)
router.patch("/admin/:id/status", authMiddleware, roleMiddleware(["admin"]), updateAdminOrderStatus)

export default router;