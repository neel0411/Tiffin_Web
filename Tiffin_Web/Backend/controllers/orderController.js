// controllers/orderController.js
import Order from "../models/order.js";
import OrderItem from "../models/orderItem.js";
import Billing from "../models/billing.js";
import Menu from "../models/menu.js";

// ➕ Create new order
export const createOrder = async (req, res) => {
  try {
    const customer_id = req.user.id;

    console.log("🆕 Creating new order for customer:", customer_id);

    const order = new Order({ customer_id });
    await order.save();

    res.status(201).json({
      message: "Order created successfully",
      order: order
    });
  } catch (err) {
    console.error("❌ Order create error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ➕ Add order item with auto supplier_id
export const addOrderItem = async (req, res) => {
  try {
    const { order_id, menu_id, qty, price } = req.body;

    console.log("📦 Adding order item:", { order_id, menu_id, qty, price });

    // Get menu item to extract supplier_id automatically
    const menuItem = await Menu.findById(menu_id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const orderItem = new OrderItem({
      order_id,
      menu_id,
      supplier_id: menuItem.supplier_id, // Auto-get from menu
      qty,
      price,
    });

    await orderItem.save();

    res.status(201).json({
      message: "Order item added successfully",
      orderItem: orderItem
    });
  } catch (err) {
    console.error("❌ Order item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ➕ Add multiple order items at once
export const addMultipleOrderItems = async (req, res) => {
  try {
    const { order_id, items } = req.body;

    console.log("📦 Adding multiple order items for order:", order_id);

    const orderItems = [];
    for (const item of items) {
      const menuItem = await Menu.findById(item.menu_id);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.menu_id} not found` });
      }

      const orderItem = new OrderItem({
        order_id,
        menu_id: item.menu_id,
        supplier_id: menuItem.supplier_id,
        qty: item.qty,
        price: item.price,
      });

      await orderItem.save();
      orderItems.push(orderItem);
    }

    res.status(201).json({
      message: "Order items added successfully",
      orderItems: orderItems
    });
  } catch (err) {
    console.error("❌ Multiple order items error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/// 📦 Get all orders for logged-in customer - FIXED POPULATION
export const getCustomerOrders = async (req, res) => {
  try {
    const customer_id = req.user.id;
    console.log("👤 Fetching orders for customer ID:", customer_id);

    const orders = await Order.find({ customer_id })
      .sort({ createdAt: -1 });

    // Get order items with PROPER population
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await OrderItem.find({ order_id: order._id })
          .populate('menu_id', 'menu_name menu_price menu_image menu_type') // ✅ FIXED: Correct field names
          .populate('supplier_id', 'name company_name');
        
        const billing = await Billing.findOne({ order_id: order._id });

        console.log("🔍 Order Items with Menu Data:", orderItems.map(item => ({
          menu_id: item.menu_id,
          menu_name: item.menu_id?.menu_name,
          menu_image: item.menu_id?.menu_image,
          hasMenuData: !!item.menu_id
        })));

        // Group items by supplier
        const itemsBySupplier = {};
        let totalAmount = 0;

        orderItems.forEach(item => {
          if (!item.menu_id) {
            console.warn("⚠️ Menu data missing for item:", item._id);
            return;
          }

          const supplierId = item.supplier_id?._id?.toString() || 'unknown';
          if (!itemsBySupplier[supplierId]) {
            itemsBySupplier[supplierId] = {
              supplier: item.supplier_id || { name: 'Unknown Supplier' },
              items: [],
              subtotal: 0
            };
          }
          itemsBySupplier[supplierId].items.push(item);
          const itemTotal = item.price * item.qty;
          itemsBySupplier[supplierId].subtotal += itemTotal;
          totalAmount += itemTotal;
        });

        return {
          ...order.toObject(),
          items: orderItems,
          itemsBySupplier: itemsBySupplier,
          totalAmount: totalAmount,
          billing: billing || null
        };
      })
    );

    console.log(`✅ Found ${ordersWithDetails.length} orders for customer`);
    res.json(ordersWithDetails);
  } catch (err) {
    console.error("❌ Get customer orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📦 Get all orders for supplier (Multi-supplier compatible)
export const getSupplierOrders = async (req, res) => {
  try {
    const supplierId = req.user.id;
    console.log("🏪 Fetching orders for supplier ID:", supplierId);

    // Find all order items that belong to this supplier
    const supplierOrderItems = await OrderItem.find({ supplier_id: supplierId })
      .populate('order_id')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${supplierOrderItems.length} order items for supplier`);

    // Group order items by order_id
    const ordersMap = new Map();

    for (const item of supplierOrderItems) {
      const orderId = item.order_id._id.toString();
      
      if (!ordersMap.has(orderId)) {
        // Get order details with customer info
        const order = await Order.findById(orderId)
          .populate('customer_id', 'name email phone address');
        
        if (!order) continue;

        // Get all items for this order (only for current supplier) with proper population
        const allItemsForThisOrder = await OrderItem.find({ 
          order_id: orderId, 
          supplier_id: supplierId 
        })
        .populate('menu_id') // Simple populate without select to get all fields
        .populate('supplier_id', 'name company_name');

        console.log("🔍 Populated items:", allItemsForThisOrder.map(item => ({
          menu_id: item.menu_id,
          hasMenu: !!item.menu_id,
          menuName: item.menu_id?.name,
          menuData: item.menu_id
        })));

        // Get billing info
        const billing = await Billing.findOne({ order_id: orderId });

        // Calculate total for this supplier's items only
        const supplierTotal = allItemsForThisOrder.reduce(
          (sum, item) => sum + (item.price * item.qty), 0
        );

        ordersMap.set(orderId, {
          ...order.toObject(),
          items: allItemsForThisOrder,
          billing: billing || null,
          supplier_total: supplierTotal
        });
      }
    }

    const orders = Array.from(ordersMap.values());
    console.log(`📊 Final: ${orders.length} unique orders for supplier`);
    
    // Final debug - check menu names
    orders.forEach((order, index) => {
      console.log(`🔍 Order ${index + 1} menu check:`, {
        orderId: order._id,
        items: order.items.map(item => ({
          menu_id: item.menu_id,
          name: item.menu_id?.name,
          fullMenuData: item.menu_id
        }))
      });
    });

    res.json(orders);
  } catch (err) {
    console.error("❌ Get supplier orders error:", err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message
    });
  }
};

// 🔄 Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const supplierId = req.user.id;

    console.log(`🔄 Updating order status:`, { orderId: id, newStatus: status, supplierId });

    if (!['Pending', 'In Progress', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Check if this supplier has items in this order
    const supplierItems = await OrderItem.find({ 
      order_id: id, 
      supplier_id: supplierId 
    });

    if (supplierItems.length === 0) {
      return res.status(403).json({ 
        message: "Access denied. No items found for this supplier in the order." 
      });
    }

    // Update the main order status
    const order = await Order.findByIdAndUpdate(
      id,
      { order_status: status },
      { new: true }
    ).populate('customer_id', 'name email');

    res.json({
      message: "Order status updated successfully",
      order: order
    });
  } catch (err) {
    console.error("❌ Update order status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔄 Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { payment_status } = req.body;
    const supplierId = req.user.id;

    console.log(`💳 Updating payment status:`, { order_id, payment_status, supplierId });

    if (!['Pending', 'Success', 'Failed'].includes(payment_status)) {
      return res.status(400).json({ message: "Invalid payment status value" });
    }

    // Verify that the supplier has items in this order
    const supplierItems = await OrderItem.findOne({ 
      order_id, 
      supplier_id: supplierId 
    });

    if (!supplierItems) {
      return res.status(403).json({ 
        message: "Access denied. You don't have items in this order." 
      });
    }

    const billing = await Billing.findOneAndUpdate(
      { order_id },
      { payment_status },
      { new: true }
    );

    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" });
    }

    res.json({
      message: "Payment status updated successfully",
      billing: billing
    });
  } catch (err) {
    console.error("❌ Update payment status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🗑️ Delete order items for specific supplier
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const supplierId = req.user.id;

    console.log(`🗑️ Deleting order items for supplier:`, { orderId: id, supplierId });

    // Verify that the supplier has items in this order
    const supplierItems = await OrderItem.find({ 
      order_id: id, 
      supplier_id: supplierId 
    });

    if (supplierItems.length === 0) {
      return res.status(403).json({ 
        message: "Access denied. You can only delete orders containing your items." 
      });
    }

    // Only delete order items belonging to this supplier
    await OrderItem.deleteMany({ order_id: id, supplier_id: supplierId });
    
    // Check if order has any items left from other suppliers
    const remainingItems = await OrderItem.find({ order_id: id });
    
    if (remainingItems.length === 0) {
      // No items left, delete the entire order and billing
      await Billing.deleteMany({ order_id: id });
      await Order.findByIdAndDelete(id);
    }

    res.json({ message: "Order items deleted successfully" });
  } catch (err) {
    console.error("❌ Delete order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📊 Get order details with items and billing
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const supplierId = req.user.id;

    console.log("🔍 Getting order details:", { orderId: id, supplierId });

    // Verify that the supplier has items in this order
    const supplierItems = await OrderItem.find({ 
      order_id: id, 
      supplier_id: supplierId 
    });

    if (supplierItems.length === 0) {
      return res.status(403).json({ 
        message: "Access denied. No items found for this supplier in the order." 
      });
    }

    const order = await Order.findById(id)
      .populate('customer_id', 'name email phone address');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderItems = await OrderItem.find({ order_id: id, supplier_id: supplierId })
      .populate('menu_id') // Simple populate to get all menu fields
      .populate('supplier_id', 'name company_name');
      
    const billing = await Billing.findOne({ order_id: id });

    res.json({
      order: order,
      items: orderItems,
      billing: billing || null,
      supplier_total: orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
    });
  } catch (err) {
    console.error("❌ Get order details error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📈 Get supplier dashboard stats
export const getSupplierDashboardStats = async (req, res) => {
  try {
    const supplierId = req.user.id;

    // Get stats based on supplier's items only
    const totalOrderItems = await OrderItem.countDocuments({ supplier_id: supplierId });
    
    // Get unique orders count
    const uniqueOrders = await OrderItem.distinct('order_id', { supplier_id: supplierId });
    const totalOrders = uniqueOrders.length;

    const pendingOrders = await OrderItem.distinct('order_id', { 
      supplier_id: supplierId 
    }).then(async (orderIds) => {
      const orders = await Order.find({ 
        _id: { $in: orderIds },
        order_status: 'Pending'
      });
      return orders.length;
    });

    const inProgressOrders = await OrderItem.distinct('order_id', { 
      supplier_id: supplierId 
    }).then(async (orderIds) => {
      const orders = await Order.find({ 
        _id: { $in: orderIds },
        order_status: 'In Progress'
      });
      return orders.length;
    });

    const deliveredOrders = await OrderItem.distinct('order_id', { 
      supplier_id: supplierId 
    }).then(async (orderIds) => {
      const orders = await Order.find({ 
        _id: { $in: orderIds },
        order_status: 'Delivered'
      });
      return orders.length;
    });

    // Get recent 5 orders
    const recentOrderItems = await OrderItem.find({ supplier_id: supplierId })
      .populate('order_id')
      .populate('menu_id') // Simple populate
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalOrders,
        totalOrderItems,
        pendingOrders,
        inProgressOrders,
        deliveredOrders
      },
      recentOrders: recentOrderItems
    });
  } catch (err) {
    console.error("❌ Get dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📦 Get all orders for ADMIN (NEW FUNCTION)
export const getAdminOrders = async (req, res) => {
  try {
    console.log("🔄 Fetching all orders for admin...");
    
    const orders = await Order.find()
      .populate("customer_id", "name email phone")
      .sort({ order_date: -1 });

    // Get order items and billing for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await OrderItem.find({ order_id: order._id })
          .populate('menu_id', 'menu_name menu_price')
          .populate('supplier_id', 'name company_name');

        const billing = await Billing.findOne({ order_id: order._id });

        // Calculate total amount
        const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

        // Get items list
        const itemsList = orderItems.map(item => 
          `${item.menu_id?.menu_name || 'Unknown'} (${item.qty})`
        ).join(", ");

        return {
          _id: order._id,
          customer_name: order.customer_id?.name || "Unknown Customer",
          customer_email: order.customer_id?.email || "N/A",
          items: itemsList,
          total_amount: totalAmount,
          order_status: order.order_status,
          order_date: order.order_date,
          payment_status: billing?.payment_status || "Pending",
          payment_mode: billing?.payment_mode || "N/A"
        };
      })
    );

    console.log(`✅ Found ${ordersWithDetails.length} orders for admin`);
    res.json(ordersWithDetails);
    
  } catch (err) {
    console.error("❌ Error fetching admin orders:", err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// 🔄 Update order status (ADMIN ONLY)
export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Admin updating order status:`, { orderId: id, newStatus: status });

    if (!['Pending', 'In Progress', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { order_status: status },
      { new: true }
    ).populate('customer_id', 'name email');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order status updated successfully",
      order: order
    });
  } catch (err) {
    console.error("❌ Update order status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
