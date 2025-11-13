import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { orderAPI } from "../../../services/api";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems = [], subtotal = 0, gst = 0, total = 0 } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    upiId: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [customerProfile, setCustomerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // ✅ FIXED: Get restaurant name from populated supplier data
  const getRestaurantName = (supplier) => {
    if (!supplier) return "Unknown Restaurant";
    
    // Check if supplier is populated object or just ID
    if (typeof supplier === 'object' && supplier !== null) {
      return supplier.company_name || supplier.name || `Restaurant ${supplier._id?.slice(-4) || 'Unknown'}`;
    }
    
    return `Restaurant ${supplier?.slice(-4) || 'Unknown'}`;
  };

  // ✅ Fetch customer profile data
  const fetchCustomerProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("No token found, user needs to login");
        return;
      }

      const response = await api.get("/customers/me");
      console.log("📋 Customer profile data:", response.data);
      
      if (response.data) {
        setCustomerProfile(response.data);
        
        // Pre-fill form with customer data
        setFormData({
          fullName: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
          upiId: "",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching customer profile:", error);
      // Continue with empty form if profile fetch fails
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Fetch customer profile when component loads
    fetchCustomerProfile();

    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty! Redirecting to menu...");
      navigate("/menu");
      return;
    }

    // ✅ DEBUG: Check if cart has multiple suppliers
    const suppliers = new Set();
    cartItems.forEach(item => {
      if (item.menu_id?.supplier_id) {
        const supplierName = getRestaurantName(item.menu_id.supplier_id);
        suppliers.add(supplierName);
      }
    });
    
    console.log("🛒 Cart Suppliers Debug:", {
      totalSuppliers: suppliers.size,
      suppliers: Array.from(suppliers),
      items: cartItems.map(item => ({
        name: item.menu_id?.menu_name,
        supplier: item.menu_id?.supplier_id,
        supplierName: getRestaurantName(item.menu_id?.supplier_id),
        price: item.menu_id?.menu_price,
        qty: item.qty
      }))
    });
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.address.trim()) newErrors.address = "Delivery address is required";
    
    if (paymentMethod === "upi" && !formData.upiId.trim()) {
      newErrors.upiId = "UPI ID is required for UPI payment";
    } else if (paymentMethod === "upi" && formData.upiId && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId)) {
      newErrors.upiId = "Invalid UPI ID format (e.g., name@bank)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ PREVIEW BILL FUNCTION
  const handlePreviewBill = () => {
    if (!validateForm()) {
      alert("Please fill all the details before proceeding with payment.");
      return;
    }

    navigate("/bill", { 
      state: { 
        cartItems, 
        subtotal, 
        gst, 
        total,
        orderId: `PREVIEW_${Date.now()}`,
        paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "UPI Payment",
        customerInfo: formData,
        isPreview: true
      } 
    });
  };

  // ✅ FIXED: MULTI-SUPPLIER PAYMENT PROCESSING
  const handlePay = async () => {
    if (!validateForm()) {
      alert("Please fix the errors before proceeding with payment.");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty!");
      navigate("/menu");
      return;
    }

    try {
      setLoading(true);
      setStep(1);
      
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to place an order. Redirecting to login...");
        navigate("/login");
        return;
      }

      console.log("🔄 Starting MULTI-SUPPLIER payment process...");

      // ✅ 1️⃣ Group cart items by supplier
      const itemsBySupplier = {};
      cartItems.forEach(item => {
        const supplier = item.menu_id?.supplier_id;
        if (!supplier) {
          console.warn("⚠️ Item without supplier_id:", item);
          return;
        }
        
        const supplierId = typeof supplier === 'object' ? supplier._id : supplier;
        const supplierName = getRestaurantName(supplier);
        
        if (!itemsBySupplier[supplierId]) {
          itemsBySupplier[supplierId] = {
            supplierName: supplierName,
            items: [],
            subtotal: 0
          };
        }
        itemsBySupplier[supplierId].items.push(item);
        itemsBySupplier[supplierId].subtotal += (item.menu_id?.menu_price || 0) * item.qty;
      });

      console.log("📦 Items grouped by supplier:", itemsBySupplier);

      const orderIds = [];
      const orderDetails = [];

      // ✅ 2️⃣ Create separate orders for each supplier
      for (const [supplierId, supplierData] of Object.entries(itemsBySupplier)) {
        console.log(`📝 Creating order for supplier: ${supplierData.supplierName}`);
        setStep(2);
        
        try {
          // Create order (without supplier_id since it's removed from order model)
          const orderRes = await api.post("/orders", {});
          const orderId = orderRes.data.order._id;
          orderIds.push(orderId);

          console.log(`✅ Order created for ${supplierData.supplierName}:`, orderId);
          setStep(3);

          // ✅ 3️⃣ Add items for this supplier to the order
          for (const item of supplierData.items) {
            if (!item.menu_id?._id) {
              console.error("❌ Invalid menu item:", item);
              continue;
            }
            
            const itemPayload = {
              order_id: orderId,
              menu_id: item.menu_id._id,
              qty: item.qty,
              price: item.menu_id.menu_price
            };
            
            console.log("📤 Sending item:", itemPayload);
            await api.post("/orders/items", itemPayload);
          }

          console.log(`✅ Added ${supplierData.items.length} items for ${supplierData.supplierName}`);
          setStep(4);

          // ✅ 4️⃣ Create billing for this supplier's order
          const supplierGst = supplierData.subtotal * 0.05;
          const supplierTotal = supplierData.subtotal + supplierGst;

          const billingPayload = {
            order_id: orderId,
            total_amount: supplierTotal,
            payment_mode: paymentMethod.toUpperCase(),
            payment_status: paymentMethod === "cod" ? "Pending" : "Success",
          };

          await api.post("/billing", billingPayload);
          console.log(`✅ Billing created for ${supplierData.supplierName}: ₹${supplierTotal}`);

          orderDetails.push({
            orderId,
            supplierId,
            supplierName: supplierData.supplierName,
            items: supplierData.items,
            subtotal: supplierData.subtotal,
            total: supplierTotal
          });

        } catch (supplierError) {
          console.error(`❌ Error processing supplier ${supplierData.supplierName}:`, supplierError);
          throw new Error(`Failed to process order for ${supplierData.supplierName}`);
        }
      }

      // ✅ 5️⃣ Clear cart after all orders are created
      setStep(5);
      console.log("🛒 Clearing cart...");
      
      try {
        await api.delete("/cart/clear/all");
        console.log("✅ Cart cleared successfully");
      } catch (cartError) {
        console.warn("⚠️ Cart clearing failed:", cartError);
        // Continue even if cart clear fails
      }

      setStep(6);
      
      // ✅ 6️⃣ Navigate to success page
      setTimeout(() => {
        navigate("/bill", { 
          state: { 
            cartItems, 
            subtotal, 
            gst, 
            total,
            orderIds: orderIds,
            orderDetails: orderDetails,
            paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "UPI Payment",
            customerInfo: formData,
            isPreview: false,
            multiSupplier: true,
            supplierCount: Object.keys(itemsBySupplier).length
          } 
        });
      }, 1000);

    } catch (error) {
      console.error("❌ MULTI-SUPPLIER PAYMENT ERROR:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = "Payment failed. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Payment failed: ${errorMessage}`);
    } finally {
      setLoading(false);
      setStep(0);
    }
  };

  const steps = [
    "Initializing...",
    "Grouping items by restaurant...",
    "Creating orders...",
    "Adding menu items...",
    "Processing payments...",
    "Clearing cart...",
    "Finalizing your order..."
  ];

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formattedPhone });
    
    if (errors.phone) {
      setErrors({ ...errors, phone: "" });
    }
  };

  // Get button text based on payment method
  const getPaymentButtonText = () => {
    if (paymentMethod === "cod") {
      return `Place Order (₹${total.toFixed(2)})`;
    } else {
      return `Pay ₹${total.toFixed(2)} Now`;
    }
  };

  // Get supplier count for display
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-800 mb-4">
            Secure <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Payment</span>
          </h1>
          <p className="text-xl text-slate-600">Complete your order with confidence</p>
          
          {/* Profile loaded indicator */}
          {customerProfile && !profileLoading && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4 inline-block">
              <div className="flex items-center gap-3 text-green-700">
                <span className="text-xl">✅</span>
                <span className="font-semibold">
                  Your profile details are pre-filled below
                </span>
              </div>
            </div>
          )}
          
          {/* Multi-supplier info */}
          {getSupplierCount() > 1 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 inline-block">
              <div className="flex items-center gap-3 text-blue-700">
                <span className="text-xl">🏪</span>
                <span className="font-semibold">
                  Ordering from {getSupplierCount()} different restaurants
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-slate-800">Personal Information</h2>
                {customerProfile && (
                  <span className="text-sm bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                    <span>✅</span>
                    Profile Loaded
                  </span>
                )}
              </div>
              
              {profileLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Loading your profile details...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-3">
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleChange} 
                      className={`w-full border-2 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-700 ${
                        errors.fullName ? "border-red-500" : "border-slate-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-2">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-3">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className={`w-full border-2 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-700 ${
                        errors.email ? "border-red-500" : "border-slate-300"
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-3">
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handlePhoneChange} 
                      className={`w-full border-2 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-700 ${
                        errors.phone ? "border-red-500" : "border-slate-300"
                      }`}
                      placeholder="987 654 3210"
                      maxLength="12"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-2">{errors.phone}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold text-slate-700 mb-3">
                      Delivery Address *
                    </label>
                    <textarea 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      rows="4"
                      className={`w-full border-2 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-700 ${
                        errors.address ? "border-red-500" : "border-slate-300"
                      }`}
                      placeholder="Enter complete delivery address with landmark"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-2">{errors.address}</p>}
                    {customerProfile?.address && !formData.address && (
                      <p className="text-slate-500 text-sm mt-2">
                        Your saved address is pre-filled. You can edit it if needed.
                      </p>
                    )}
                  </div>

                  {/* Edit Note */}
                  <div className="md:col-span-2 mt-4 p-4 bg-cyan-50 rounded-2xl border border-cyan-200">
                    <div className="flex items-start gap-3 text-cyan-700">
                      <span className="text-xl">✏️</span>
                      <div>
                        <p className="font-semibold text-sm">All fields are editable</p>
                        <p className="text-sm">Feel free to update any information for this order</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-3xl font-black text-slate-800 mb-6">Payment Method</h2>
              <div className="space-y-4">
                <div 
                  className={`flex items-center justify-between p-6 border-2 rounded-2xl transition-all cursor-pointer ${
                    paymentMethod === "upi" ? "border-cyan-500 bg-cyan-50" : "border-slate-200 hover:border-cyan-300 bg-white"
                  }`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <label className="flex items-center gap-4 cursor-pointer w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-7 h-7 border-2 border-slate-300 rounded-full flex items-center justify-center">
                        {paymentMethod === "upi" && <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>}
                      </div>
                      <span className="font-bold text-slate-800 text-lg">UPI Payment</span>
                    </div>
                    <span className="text-cyan-600 font-semibold">Instant</span>
                  </label>
                </div>

                <div 
                  className={`flex items-center justify-between p-6 border-2 rounded-2xl transition-all cursor-pointer ${
                    paymentMethod === "cod" ? "border-cyan-500 bg-cyan-50" : "border-slate-200 hover:border-cyan-300 bg-white"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <label className="flex items-center gap-4 cursor-pointer w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-7 h-7 border-2 border-slate-300 rounded-full flex items-center justify-center">
                        {paymentMethod === "cod" && <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>}
                      </div>
                      <span className="font-bold text-slate-800 text-lg">Cash on Delivery</span>
                    </div>
                    <span className="text-slate-600">Pay when delivered</span>
                  </label>
                </div>

                {paymentMethod === "upi" && (
                  <div className="mt-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-200">
                    <label className="block text-lg font-semibold text-slate-700 mb-3">
                      UPI ID *
                    </label>
                    <input 
                      type="text" 
                      name="upiId" 
                      value={formData.upiId} 
                      onChange={handleChange} 
                      className={`w-full border-2 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-700 ${
                        errors.upiId ? "border-red-500" : "border-slate-300"
                      }`}
                      placeholder="name@bank"
                    />
                    {errors.upiId && <p className="text-red-500 text-sm mt-2">{errors.upiId}</p>}
                    <p className="text-slate-600 text-sm mt-3">Enter your UPI ID for instant payment</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-8">
            {/* Order Summary Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-slate-200 sticky top-8">
              <h2 className="text-3xl font-black text-slate-800 mb-6">Order Summary</h2>
              
              {/* Supplier-wise breakdown */}
              {(() => {
                const suppliers = {};
                cartItems.forEach(item => {
                  const supplier = item.menu_id?.supplier_id;
                  if (supplier) {
                    const supplierId = typeof supplier === 'object' ? supplier._id : supplier;
                    const supplierName = getRestaurantName(supplier);
                    
                    if (!suppliers[supplierId]) {
                      suppliers[supplierId] = {
                        name: supplierName,
                        items: [],
                        subtotal: 0
                      };
                    }
                    suppliers[supplierId].items.push(item);
                    suppliers[supplierId].subtotal += (item.menu_id?.menu_price || 0) * item.qty;
                  }
                });

                return (
                  <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
                    {Object.values(suppliers).map((supplier, idx) => (
                      <div key={idx} className="pb-4 border-b border-slate-200 last:border-b-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl">🏪</span>
                          <span className="font-bold text-slate-700 text-sm">{supplier.name}</span>
                        </div>
                        <div className="space-y-2 ml-8">
                          {supplier.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex justify-between items-center text-sm">
                              <span className="truncate flex-1 text-slate-600">{item.menu_id?.menu_name} × {item.qty}</span>
                              <span className="font-semibold whitespace-nowrap ml-2 text-slate-800">
                                ₹{((item.menu_id?.menu_price || 0) * item.qty).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex justify-between text-slate-700 text-lg">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 text-lg">
                  <span>GST (5%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-slate-800 pt-3 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <button 
                  onClick={handlePay} 
                  disabled={loading || profileLoading}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl ${
                    loading || profileLoading
                      ? "bg-slate-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {paymentMethod === "cod" ? "Placing Order..." : "Processing..."}
                    </div>
                  ) : profileLoading ? (
                    "Loading Profile..."
                  ) : (
                    getPaymentButtonText()
                  )}
                </button>
                
                <button 
                  onClick={handlePreviewBill}
                  disabled={profileLoading}
                  className="w-full py-3 bg-white border-2 border-cyan-500 text-cyan-600 rounded-2xl font-semibold hover:bg-cyan-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Preview Bill
                </button>
                
                <button 
                  onClick={() => navigate("/cart")} 
                  className="w-full py-3 bg-slate-500 text-white rounded-2xl font-semibold hover:bg-slate-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Back to Cart
                </button>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-cyan-50 rounded-2xl border border-cyan-200">
                <div className="flex items-center gap-3 text-cyan-700">
                  <span className="text-xl">🔒</span>
                  <span className="font-semibold">Secure SSL Encryption</span>
                </div>
                <p className="text-cyan-600 text-sm mt-2">
                  Your payment information is protected with bank-level security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-cyan-500">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-cyan-200 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
                  {getSupplierCount() > 1 ? "🏪" : paymentMethod === "cod" ? "📦" : "💰"}
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-slate-800 mb-2">
                {getSupplierCount() > 1 ? `Processing ${getSupplierCount()} Restaurant Orders` : 
                 paymentMethod === "cod" ? "Placing Order" : "Processing Payment"}
              </h3>
              <p className="text-cyan-600 font-semibold">{steps[step]}</p>
              {getSupplierCount() > 1 && (
                <p className="text-sm text-slate-600 mt-1">
                  Each restaurant will prepare your items separately
                </p>
              )}
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>

            <p className="text-center text-sm text-slate-600 mt-4">
              Please don't close this window...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;