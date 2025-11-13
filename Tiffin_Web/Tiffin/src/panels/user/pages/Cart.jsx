import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../../../services/api";
import { toast, Toaster } from "react-hot-toast";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads/")) return `${baseUrl}${imagePath}`;
    return `${baseUrl}/uploads/menu/${imagePath}`;
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      const cartData = res.data.cart || res.data || [];
      setCartItems(Array.isArray(cartData) ? cartData : []);
    } catch (err) {
      console.error("Cart fetch error:", err);
      if (err.response?.status === 401) {
        toast.error("Please login first");
      } else {
        toast.error("Failed to load cart items");
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const getRestaurantName = (supplier) => {
    if (!supplier) return "Unknown Restaurant";
    if (typeof supplier === 'object' && supplier !== null) {
      return supplier.company_name || supplier.name || `Restaurant ${supplier._id?.slice(-4) || 'Unknown'}`;
    }
    return `Restaurant ${supplier?.slice(-4) || 'Unknown'}`;
  };

  const updateQty = async (cart_id, qty) => {
    if (qty < 1) return;
    try {
      const res = await api.put("/cart", { cart_id, qty });
      if (res.data.success) {
        await fetchCart();
        toast.success("Quantity updated");
      }
    } catch (error) {
      toast.error("❌ Failed to update quantity");
    }
  };

  const removeItem = async (id) => {
    try {
      const res = await api.delete(`/cart/${id}`);
      if (res.data.success) {
        toast.success("Item removed from cart");
        await fetchCart();
      }
    } catch (error) {
      toast.error("❌ Failed to remove item");
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) return;
    try {
      setLoading(true);
      const res = await api.delete("/cart/clear/all");
      if (res.data.success) {
        toast.success("Cart cleared successfully!");
        await fetchCart();
      }
    } catch (err) {
      toast.error("❌ Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  const getSubtotal = () =>
    cartItems.reduce((sum, item) => sum + (item.menu_id?.menu_price || 0) * item.qty, 0);

  const getGST = (subtotal) => Math.round(subtotal * 0.05);

  const getSupplierCount = () => {
    const suppliers = new Set();
    cartItems.forEach(item => {
      if (item.menu_id?.supplier_id) {
        const supplierId = typeof item.menu_id.supplier_id === 'object' 
          ? item.menu_id.supplier_id._id 
          : item.menu_id.supplier_id;
        suppliers.add(supplierId);
      }
    });
    return suppliers.size;
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const subtotal = getSubtotal();
    const gst = getGST(subtotal);
    const total = subtotal + gst;

    navigate("/payment", {
      state: { cartItems, subtotal, gst, total },
    });
  };

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen py-24 px-6">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-slate-800 mb-4">
            My <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Tiffin Cart</span>
          </h2>
          <p className="text-lg text-slate-600">Review and manage your order items</p>
        </div>

        {loading && cartItems.length === 0 ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-xl text-slate-600 font-medium">Loading your tiffin items...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 text-slate-400">🛒</div>
            <p className="text-xl text-slate-500 mb-6">Your cart is empty.</p>
            <button 
              onClick={() => navigate("/menu")}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-slate-200">
              {getSupplierCount() > 1 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <div className="flex items-center gap-3 text-blue-700">
                    <span className="text-2xl">🏪</span>
                    <div>
                      <p className="font-bold">Ordering from {getSupplierCount()} restaurants</p>
                      <p className="text-sm">Each restaurant will prepare your items separately</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {cartItems.map((item) => {
                  const imageUrl = getImageUrl(item.menu_id?.menu_image);
                  const restaurantName = getRestaurantName(item.menu_id?.supplier_id);
                  
                  return (
                    <div
                      key={item._id}
                      className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-6 flex-1 mb-4 sm:mb-0">
                        <img
                          src={imageUrl}
                          alt={item.menu_id?.menu_name}
                          className="w-20 h-20 object-cover rounded-2xl shadow-md"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {item.menu_id?.menu_name || "Unknown Item"}
                          </h3>
                          <p className="text-slate-600 mb-1">₹{item.menu_id?.menu_price || 0} per item</p>
                          <p className="text-blue-600 font-semibold text-sm">
                            🏪 {restaurantName}
                          </p>
                          <p className="text-slate-800 font-bold text-lg mt-2">
                            Subtotal: ₹{((item.menu_id?.menu_price || 0) * item.qty).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-2">
                          <button
                            onClick={() => updateQty(item._id, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            <span className="text-lg font-bold">-</span>
                          </button>
                          <span className="text-lg font-bold w-8 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item._id, item.qty + 1)}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg hover:bg-slate-200 transition-all shadow-sm"
                          >
                            <span className="text-lg font-bold">+</span>
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="px-4 py-3 text-red-600 font-semibold hover:text-red-800 transition-all border border-red-200 rounded-xl hover:bg-red-50 flex items-center gap-2 shadow-sm"
                        >
                          <span className="text-lg">🗑️</span>
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {cartItems.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={clearCart}
                    disabled={loading}
                    className="px-8 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all font-bold text-lg disabled:opacity-50 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Clearing...
                      </>
                    ) : (
                      <>
                        <span>🗑️</span>
                        Clear Entire Cart
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="w-full lg:w-96 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-slate-200 h-max lg:sticky lg:top-32">
              <h3 className="text-3xl font-black text-slate-800 mb-8">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-700 text-lg">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 text-lg">
                  <span>GST (5%)</span>
                  <span className="font-bold">₹{getGST(getSubtotal()).toFixed(2)}</span>
                </div>
                <hr className="my-4 border-slate-300" />
                <div className="flex justify-between font-black text-2xl text-slate-800">
                  <span>Total Amount</span>
                  <span>₹{(getSubtotal() + getGST(getSubtotal())).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={cartItems.length === 0}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cartItems.length === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
              </button>

              {getSupplierCount() > 1 && (
                <div className="mt-6 p-4 bg-cyan-50 border border-cyan-200 rounded-2xl">
                  <div className="flex items-center gap-3 text-cyan-700">
                    <span className="text-xl">🏪</span>
                    <div>
                      <p className="font-bold text-sm">Multi-Restaurant Order</p>
                      <p className="text-xs">Items from {getSupplierCount()} different restaurants</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: 'white',
            color: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          },
        }}
      />
    </>
  );
}

export default Cart;