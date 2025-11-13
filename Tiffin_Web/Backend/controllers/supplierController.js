import Supplier from "../models/supplier.js";
import Order from "../models/order.js";
import Feedback from "../models/feedback.js";
import Menu from "../models/menu.js";
import Billing from "../models/billing.js";
import OrderItem from "../models/orderItem.js";
import mongoose from "mongoose";

// Get all suppliers (for admin)
export const getSuppliers = async (req, res) => {
  try {
    console.log("🔄 Fetching all suppliers from database...");
    
    const suppliers = await Supplier.find().select('-password');
    
    console.log(`✅ Found ${suppliers.length} suppliers`);
    res.json(suppliers);
    
  } catch (err) {
    console.error("❌ Error fetching suppliers:", err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// ✅ Block/unblock supplier - YE WALA FIX KARO
export const blockSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Blocking/unblocking supplier with ID: ${id}`);

    // Direct find and save approach - YE BETTER HAI
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Toggle status
    supplier.status = supplier.status === 'active' ? 'blocked' : 'active';
    await supplier.save();

    console.log(`✅ Supplier ${supplier.name} status updated to: ${supplier.status}`);

    res.json({
      message: `Supplier ${supplier.status === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        email: supplier.email,
        company_name: supplier.company_name,
        status: supplier.status, // ✅ Updated status
        phone: supplier.phone,
        createdAt: supplier.createdAt
      }
    });
    
  } catch (err) {
    console.error('❌ Error toggling supplier block status:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get supplier profile
export const getSupplierProfile = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.user.id).select('-password');
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update supplier profile
export const updateSupplierProfile = async (req, res) => {
  try {
    const { name, phone, address, company_name } = req.body;
    
    const supplier = await Supplier.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, company_name },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.json({ message: 'Profile updated successfully', supplier });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    console.log("📊 Dashboard request received from supplier:", req.user.id);

    const supplierId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      return res.status(400).json({ error: "Invalid supplier ID" });
    }

    const supplierObjectId = new mongoose.Types.ObjectId(supplierId);

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { supplier_id: supplierObjectId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          deliveredOrders: { $sum: { $cond: [{ $eq: ["$order_status", "Delivered"] }, 1, 0] } },
          pendingOrders: { $sum: { $cond: [{ $eq: ["$order_status", "Pending"] }, 1, 0] } },
          inProgressOrders: { $sum: { $cond: [{ $eq: ["$order_status", "In Progress"] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ["$order_status", "Cancelled"] }, 1, 0] } }
        }
      }
    ]);

    // Get feedback statistics
    const feedbackStats = await Feedback.aggregate([
      { $match: { supplier_id: supplierObjectId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalFeedbacks: { $sum: 1 }
        }
      }
    ]);

    // Get menu items count
    const menuItemsCount = await Menu.countDocuments({ supplier_id: supplierId });

    // Get revenue statistics from Billing
    const revenueStats = await Billing.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order"
        }
      },
      { $unwind: "$order" },
      { $match: { "order.supplier_id": supplierObjectId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total_amount" },
          successfulPayments: { $sum: { $cond: [{ $eq: ["$payment_status", "Success"] }, 1, 0] } },
          pendingPayments: { $sum: { $cond: [{ $eq: ["$payment_status", "Pending"] }, 1, 0] } },
          failedPayments: { $sum: { $cond: [{ $eq: ["$payment_status", "Failed"] }, 1, 0] } }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ supplier_id: supplierId })
      .sort({ order_date: -1 })
      .limit(5)
      .populate("customer_id", "name email")
      .lean();

    // Calculate total amount for each order
    const recentOrdersWithAmounts = await Promise.all(
      recentOrders.map(async (order) => {
        const orderItems = await OrderItem.find({ order_id: order._id });
        const totalAmount = orderItems.reduce((total, item) => total + (item.price * item.qty), 0);
        
        return {
          _id: order._id,
          order_status: order.order_status,
          total_amount: totalAmount,
          order_date: order.order_date,
          customer_name: order.customer_id?.name || "Unknown Customer"
        };
      })
    );

    // Get recent feedbacks
    const recentFeedbacks = await Feedback.find({ supplier_id: supplierId })
      .sort({ feedback_date: -1 })
      .limit(3)
      .populate("customer_id", "name") 
      .lean();

    // Prepare dashboard data
    const dashboardData = {
      totalOrders: orderStats[0]?.totalOrders || 0,
      deliveredOrders: orderStats[0]?.deliveredOrders || 0,
      pendingOrders: orderStats[0]?.pendingOrders || 0,
      inProgressOrders: orderStats[0]?.inProgressOrders || 0,
      cancelledOrders: orderStats[0]?.cancelledOrders || 0,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      averageRating: feedbackStats[0]?.averageRating ? Number(feedbackStats[0].averageRating.toFixed(1)) : 0,
      totalFeedbacks: feedbackStats[0]?.totalFeedbacks || 0,
      menuItems: menuItemsCount,
      recentOrders: recentOrdersWithAmounts,
      recentFeedbacks: recentFeedbacks.map(f => ({
        _id: f._id,
        rating: f.rating,
        feedback_text: f.feedback_text || "No feedback text",
        customer_name: f.customer_id?.name || "Unknown Customer"
      })),
      paymentSummary: {
        successfulPayments: revenueStats[0]?.successfulPayments || 0,
        pendingPayments: revenueStats[0]?.pendingPayments || 0,
        failedPayments: revenueStats[0]?.failedPayments || 0
      }
    };

    console.log("📊 Dashboard data prepared successfully");
    res.json(dashboardData);

  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ 
      error: "Failed to load dashboard data", 
      details: err.message
    });
  }
};