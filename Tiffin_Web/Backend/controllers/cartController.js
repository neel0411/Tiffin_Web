import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Supplier from "../models/supplier.js";

// ➕ Add item to cart
const addToCart = async (req, res) => {
  try {
    const customer_id = req.user?.id;
    const { menu_id } = req.body;

    if (!menu_id) return res.status(400).json({ message: "Menu ID is required" });

    let cartItem = await Cart.findOne({ customer_id, menu_id });

    if (cartItem) {
      cartItem.qty += 1;
      await cartItem.save();
    } else {
      cartItem = new Cart({ customer_id, menu_id, qty: 1 });
      await cartItem.save();
    }

    await cartItem.populate({
      path: "menu_id",
      populate: {
        path: "supplier_id",
        select: "name company_name"
      }
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Item added to cart",
      cartItem 
    });
  } catch (err) {
    console.error("❌ Add to cart error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to add to cart", 
      error: err.message 
    });
  }
};

// 🛒 Get user's cart - FIXED: Now populates supplier name
const getCart = async (req, res) => {
  try {
    const customer_id = req.user?.id;
    const cart = await Cart.find({ customer_id }).populate({
      path: "menu_id",
      populate: {
        path: "supplier_id",
        select: "name company_name"
      }
    });
    
    res.status(200).json({ 
      success: true, 
      cart 
    });
  } catch (err) {
    console.error("❌ Get cart error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch cart", 
      error: err.message 
    });
  }
};

// ❌ Remove single item
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Removing cart item ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid cart item ID" 
      });
    }

    const deletedItem = await Cart.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ 
        success: false,
        message: "Cart item not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Item removed from cart successfully",
      deletedItem 
    });
  } catch (err) {
    console.error("❌ Remove from cart error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to remove item from cart", 
      error: err.message 
    });
  }
};

// 🔄 Update quantity
const updateCartQty = async (req, res) => {
  try {
    const { cart_id, qty } = req.body;
    
    if (!cart_id || qty === undefined) {
      return res.status(400).json({ 
        success: false,
        message: "Cart ID and quantity are required" 
      });
    }

    if (qty < 1) {
      return res.status(400).json({ 
        success: false,
        message: "Quantity must be at least 1" 
      });
    }

    const cartItem = await Cart.findById(cart_id);
    if (!cartItem) {
      return res.status(404).json({ 
        success: false,
        message: "Cart item not found" 
      });
    }

    cartItem.qty = qty;
    await cartItem.save();
    
    await cartItem.populate({
      path: "menu_id",
      populate: {
        path: "supplier_id",
        select: "name company_name"
      }
    });
    
    res.status(200).json({ 
      success: true,
      message: "Quantity updated successfully",
      cartItem 
    });
  } catch (err) {
    console.error("❌ Update cart quantity error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update cart quantity", 
      error: err.message 
    });
  }
};

// 🗑️ Clear entire cart
const clearCart = async (req, res) => {
  try {
    console.log("🔄 Attempting to clear cart...");
    
    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false,
        message: "Please login first" 
      });
    }

    const customer_id = req.user.id;
    
    const result = await Cart.deleteMany({ customer_id: customer_id });
    
    console.log("✅ Delete operation completed:", result);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("❌ Clear cart error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to clear cart", 
      error: err.message 
    });
  }
};

// ✅ Export all functions properly
export {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQty,
  clearCart
};
