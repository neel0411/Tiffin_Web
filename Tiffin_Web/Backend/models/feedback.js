import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  feedback_text: { type: String },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback_date: { type: Date, default: Date.now }
}, { timestamps: true });

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

export default Feedback;

