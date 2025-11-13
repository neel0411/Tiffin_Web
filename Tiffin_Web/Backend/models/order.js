import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  
  order_status: { type: String, enum: ['Pending','In Progress','Delivered','Cancelled'], default: 'Pending' },
  order_date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
