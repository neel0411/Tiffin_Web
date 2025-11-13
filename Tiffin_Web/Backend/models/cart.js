import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  customer_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  menu_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Menu', 
    required: true 
  },
  qty: { 
    type: Number, 
    default: 1 
  },
}, { 
  timestamps: true 
});

// Add compound index to ensure unique customer_id + menu_id combinations
cartSchema.index({ customer_id: 1, menu_id: 1 }, { unique: true });

export default mongoose.model('Cart', cartSchema);