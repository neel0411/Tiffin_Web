import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, maxlength: 100 },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ['customer'], default: 'customer' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
  