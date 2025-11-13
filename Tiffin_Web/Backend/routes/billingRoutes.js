import express from "express";
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { createBilling, getBills, getBillByOrderId } from "../controllers/billingController.js";

const router = express.Router();

// ✅ Only for logged-in users
router.post("/", authMiddleware, createBilling);
router.get("/", authMiddleware, getBills);
router.get("/order/:order_id", authMiddleware, getBillByOrderId);

export default router;