import express from "express";
import { 
  getSuppliers, 
  blockSupplier, 
  getDashboardStats,
  getSupplierProfile,
  updateSupplierProfile
} from "../controllers/supplierController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ✅ YE ADMIN ROUTES HAI - /api/supplier/...
router.get("/", authMiddleware, roleMiddleware(["admin"]), getSuppliers);
router.patch('/:id/block', authMiddleware, roleMiddleware(['admin']), blockSupplier);

// Supplier dashboard routes
router.get("/dashboard/stats", authMiddleware, roleMiddleware(["supplier"]), getDashboardStats);
router.get("/profile", authMiddleware, roleMiddleware(["supplier"]), getSupplierProfile);
router.put("/profile", authMiddleware, roleMiddleware(["supplier"]), updateSupplierProfile);

export default router;