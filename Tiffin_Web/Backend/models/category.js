import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  cat_name: { type: String, required: true, unique: true, maxlength: 100 },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);