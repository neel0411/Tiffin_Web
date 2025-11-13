// routes/feedbackRoutes.js

import express from "express";
// Import all required controller functions
import { 
    addFeedback, 
    getFeedbacks, 
    deleteFeedbackController,
    getLatestFeedbacks // ✅ ADD THIS IMPORT
} from "../controllers/feedbackController.js"; 

const router = express.Router();

// Simple auth middleware (Kept for consistency, replace with actual JWT logic)
const authMiddleware = (req, res, next) => {
  console.log("🔐 Feedback route accessed");
  // Assuming a temporary user is set for development
  req.user = { id: "temp-user" }; 
  next();
};

// POST /api/feedback - Add new feedback
router.post("/", authMiddleware, addFeedback);

// GET /api/feedback - Get all feedbacks
router.get("/", authMiddleware, getFeedbacks);

// ✅ ADD THIS ROUTE: GET /api/feedback/latest - Get latest 3 feedbacks for home page
router.get("/latest", getLatestFeedbacks); // No auth needed for home page

// 🛑 FIX: DELETE /api/feedback/:id - Delete a specific feedback
router.delete("/:id", authMiddleware, deleteFeedbackController); 

// GET /api/feedback/test - Test route
router.get("/test", (req, res) => {
  res.json({ 
    success: true,
    message: "✅ Feedback routes are working perfectly!",
    timestamp: new Date().toISOString()
  });
});

export default router;