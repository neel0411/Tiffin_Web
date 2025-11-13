import Billing from '../models/billing.js';
import Order from "../models/order.js";

// ✅ Create billing
export const createBilling = async (req, res) => {
  try {
    const { order_id, total_amount, payment_mode, payment_status } = req.body;

    // Validate payment status
    if (!['Pending', 'Success', 'Failed'].includes(payment_status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    // Check if order exists
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const billing = new Billing({
      order_id,
      total_amount,
      payment_mode,
      payment_status
    });

    await billing.save();
    res.status(201).json(billing);
  } catch (err) {
    res.status(500).json({ message: 'Billing creation failed', error: err.message });
  }
};

// ✅ Get bills (optional)
export const getBills = async (req, res) => {
  try {
    const bills = await Billing.find().populate('order_id');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get bill by order ID
export const getBillByOrderId = async (req, res) => {
  try {
    const { order_id } = req.params;
    const bill = await Billing.findOne({ order_id }).populate('order_id');
    
    if (!bill) {
      return res.status(404).json({ message: "Billing record not found" });
    }
    
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};