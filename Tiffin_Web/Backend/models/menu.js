import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  cat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  menu_name: { type: String, required: true, maxlength: 150 },
  menu_desc: { type: String },
  menu_image: { type: String },
  menu_price: { type: Number, required: true },
  menu_type: { type: String, enum: ["Veg", "Non-Veg", "Dessert", "Other"], default: "Veg" },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

const Menu = mongoose.models.Menu || mongoose.model("Menu", menuSchema);
export default Menu;
