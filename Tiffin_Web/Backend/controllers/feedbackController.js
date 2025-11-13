// feedbackController.js

import Feedback from '../models/feedback.js';

// Add new feedback
export const addFeedback = async (req, res) => {
  try {
    console.log("📥 Received feedback data:", req.body);
    console.log("👤 User making request:", req.user);
    
    const { customer_id, supplier_id, rating, feedback_text } = req.body;

    if (!customer_id || !supplier_id || !rating) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        message: "Missing required fields: customer_id, supplier_id, rating" 
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: "Rating must be between 1 and 5" 
      });
    }

    const feedback = await Feedback.create({ 
      customer_id, 
      supplier_id, 
      rating, 
      feedback_text 
    });
    
    console.log("✅ Feedback created successfully:", feedback);
    res.status(201).json(feedback);
  } catch (err) {
    console.error("❌ Controller error:", err);
    res.status(500).json({ 
      error: err.message,
      message: "Internal server error" 
    });
  }
};

// Get all feedbacks
export const getFeedbacks = async (req, res) => {
  try {
    console.log("📥 Fetching all feedbacks");
    const feedbacks = await Feedback.find().populate('customer_id supplier_id');
    console.log(`✅ Found ${feedbacks.length} feedbacks`);
    res.json(feedbacks);
  } catch (err) {
    console.error("❌ Error fetching feedbacks:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🛑 FIX: Correctly extract 'id' from req.params
export const deleteFeedbackController = async (req, res) => {
    try {
        // Use 'id' to match the route definition router.delete("/:id")
        const feedbackId = req.params.id; 
        
        // Use the extracted ID to delete
        const result = await Feedback.findByIdAndDelete(feedbackId); 
        
        if (!result) {
            return res.status(404).json({ message: "Feedback not found" });
        }
        
        res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting feedback:", err);
        // Send 400 for bad object format errors (e.g., invalid ObjectId string)
        if (err.name === 'CastError') {
             return res.status(400).json({ message: "Invalid feedback ID format" });
        }
        res.status(500).json({ error: err.message, message: "Internal server error" });
    }
};

// ✅ Get latest 3 unique customer feedbacks for home page
// ✅ Get latest 3 UNIQUE customer feedbacks for home page (NO REPEAT CUSTOMERS)
export const getLatestFeedbacks = async (req, res) => {
  try {
    console.log("📝 Fetching latest UNIQUE customer testimonials...");

    // Get all feedbacks with customer details, sorted by latest
    const allFeedbacks = await Feedback.find()
      .populate('customer_id', 'name')
      .sort({ createdAt: -1 });

    // Filter for unique customers (no repeats)
    const uniqueCustomerFeedbacks = [];
    const customerIds = new Set(); // Track customer IDs

    for (const feedback of allFeedbacks) {
      const customerId = feedback.customer_id?._id?.toString();
      
      // Skip if customer already exists or customer data is missing
      if (!customerId || customerIds.has(customerId)) {
        continue;
      }

      // Add to unique list
      uniqueCustomerFeedbacks.push(feedback);
      customerIds.add(customerId);

      // Stop when we have 3 unique customers
      if (uniqueCustomerFeedbacks.length >= 3) {
        break;
      }
    }

    console.log(`✅ Found ${uniqueCustomerFeedbacks.length} unique customer testimonials`);

    // If we don't have enough unique feedbacks, use fallback
    if (uniqueCustomerFeedbacks.length < 3) {
      console.log("⚠️ Less than 3 unique feedbacks, using available ones...");
      // We'll use whatever unique ones we have
    }

    res.json(uniqueCustomerFeedbacks);
  } catch (err) {
    console.error("❌ Get latest feedbacks error:", err);
    res.status(500).json({ 
      message: "Error fetching testimonials",
      error: err.message 
    });
  }
};