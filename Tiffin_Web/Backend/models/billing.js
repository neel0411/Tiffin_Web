import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  total_amount: { type: Number, required: true },
  payment_mode: { type: String, enum: ['UPI','Card','COD'], required: true },
  payment_status: { type: String, enum: ['Pending','Success','Failed'], default: 'Pending' },
  bill_date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Billing', billingSchema);
