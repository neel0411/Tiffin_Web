// Category.jsx - MOBILE-FIRST REDESIGN
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../../../services/api";
import { toast, Toaster } from "react-hot-toast";

function Category() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all, delivered, progress, cancelled

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://tiffin-web-so1c.onrender.com";

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    return order.order_status?.toLowerCase().includes(activeTab.toLowerCase());
  });

  // Image URL handling
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "undefined" || imagePath === "null") {
      return null;
    }
    
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    
    if (imagePath.startsWith("uploads/")) {
      return `${baseUrl}/${imagePath}`;
    }
    
    if (imagePath.startsWith("/")) {
      return `${baseUrl}${imagePath}`;
    }
    
    return `${baseUrl}/uploads/${imagePath}`;
  };

  // Image component with fallback
  const ImageWithFallback = ({ src, alt, className, item }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [errorCount, setErrorCount] = useState(0);

    const handleError = () => {
      if (errorCount === 0) {
        setImgSrc(null);
        setErrorCount(1);
      } else {
        setImgSrc(null);
      }
    };

    if (imgSrc) {
      return (
        <img
          src={imgSrc}
          alt={alt}
          className={className}
          onError={handleError}
        />
      );
    }

    const getFoodEmoji = () => {
      const menuType = item?.menu_id?.menu_type || item?.menu_type || "Veg";
      switch (menuType.toLowerCase()) {
        case 'veg': return '🥗';
        case 'non-veg': return '🍗';
        case 'dessert': return '🍰';
        default: return '🍽️';
      }
    };

    const getBgColor = () => {
      const menuType = item?.menu_id?.menu_type || item?.menu_type || "Veg";
      switch (menuType.toLowerCase()) {
        case 'veg': return 'bg-green-50';
        case 'non-veg': return 'bg-red-50';
        case 'dessert': return 'bg-pink-50';
        default: return 'bg-blue-50';
      }
    };

    return (
      <div className={`${className} ${getBgColor()} flex items-center justify-center border-2 border-gray-100 rounded-xl`}>
        <span className="text-2xl">{getFoodEmoji()}</span>
      </div>
    );
  };

  // Fetch user orders
  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("⚠️ Please login to view orders");
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/orders");
      
      if (response.data && Array.isArray(response.data)) {
        const ordersWithImages = response.data.map(order => {
          if (order.items) {
            order.items.forEach((item) => {
              // Ensure image URLs are properly set
              if (item.menu_id?.menu_image) {
                item.menu_id.menu_image = getImageUrl(item.menu_id.menu_image);
              }
            });
          }
          return order;
        });
        
        setOrders(ordersWithImages);
        
        if (ordersWithImages.length > 0) {
          setSelectedOrder(ordersWithImages[0]._id);
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("❌ Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderClick = (orderId) => {
    setSelectedOrder(orderId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-500 text-white';
      case 'In Progress': return 'bg-blue-500 text-white';
      case 'Cancelled': return 'bg-rose-500 text-white';
      case 'Pending': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Success': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'Failed': return 'bg-rose-100 text-rose-700 border border-rose-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'Success': return '✅';
      case 'Failed': return '❌';
      case 'Pending': return '⏳';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getMenuItemName = (item) => {
    return item.menu_id?.menu_name || item.menu_name || item.name || "Food Item";
  };

  const getMenuItemPrice = (item) => {
    return item.price || item.menu_id?.menu_price || 0;
  };

  const getItemQuantity = (item) => {
    return item.qty || 1;
  };

  const getMenuType = (item) => {
    return item.menu_id?.menu_type || item.menu_type || "Veg";
  };

  const getSupplierName = (item) => {
    return item.supplier_id?.company_name || item.supplier_id?.name || "Our Partner";
  };

  const calculateItemTotal = (item) => {
    return (getMenuItemPrice(item) * getItemQuantity(item));
  };

  const currentOrder = orders.find(order => order._id === selectedOrder);

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen pt-20 bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 font-medium">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen pt-20 pb-16 bg-gray-50">
        {/* Header Section */}
      <div className="text-center mb-6 mt-6">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-3">
                My <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Orders</span>
              </h2>
              <p className="text-slate-600">
                Track and manage your food orders
              </p>
            </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Status Filter Tabs - Mobile Horizontal Scroll */}
          {orders.length > 0 && (
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto scrollbar-hide">
                {[
                  { id: "all", label: "All Orders", count: orders.length },
                  { id: "delivered", label: "Delivered", count: orders.filter(o => o.order_status === 'Delivered').length },
                  { id: "progress", label: "In Progress", count: orders.filter(o => o.order_status === 'In Progress').length },
                  { id: "cancelled", label: "Cancelled", count: orders.filter(o => o.order_status === 'Cancelled').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? "bg-gray-100" : "bg-gray-200"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Order List Sidebar */}
            <div className="lg:col-span-1 mb-6 lg:mb-0">
              {filteredOrders.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Order History</h3>
                    <p className="text-sm text-gray-600">{filteredOrders.length} orders found</p>
                  </div>
                  
                  <div className="max-h-96 lg:max-h-[calc(100vh-300px)] overflow-y-auto">
                    {filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        onClick={() => handleOrderClick(order._id)}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                          selectedOrder === order._id
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Order #{order._id?.slice(-8).toUpperCase()}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(order.order_date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">₹{order.totalAmount || 0}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.billing?.payment_status)}`}>
                            {order.billing?.payment_status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-lg text-gray-900 font-medium mb-2">No orders found</p>
                  <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                  <button 
                    onClick={() => window.location.href = '/menu'}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm"
                  >
                    Browse Menu
                  </button>
                </div>
              )}
            </div>

            {/* Order Details - Main Content */}
            <div className="lg:col-span-2">
              {currentOrder ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">
                          Order #{currentOrder._id?.slice(-8).toUpperCase()}
                        </h2>
                        <p className="text-blue-100">
                          Placed on {formatDate(currentOrder.order_date)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                          {currentOrder.order_status}
                        </span>
                        <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                          {getPaymentStatusIcon(currentOrder.billing?.payment_status)} {currentOrder.billing?.payment_status || 'Pending'}
                        </span>
                      </div>
                    </div>

                    {currentOrder.billing?.payment_mode && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">Payment:</span>
                        <span className="bg-white/20 px-2.5 py-1 rounded-lg border border-white/30">
                          {currentOrder.billing.payment_mode}
                        </span>
                        {currentOrder.billing.bill_date && (
                          <span className="text-blue-100">
                            on {formatDate(currentOrder.billing.bill_date)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
                    
                    {currentOrder.items && currentOrder.items.length > 0 ? (
                      <div className="space-y-4">
                        {currentOrder.items.map((item, index) => {
                          const imageUrl = getImageUrl(item.menu_id?.menu_image);
                          const itemName = getMenuItemName(item);
                          const itemPrice = getMenuItemPrice(item);
                          const itemQuantity = getItemQuantity(item);
                          const itemTotal = calculateItemTotal(item);
                          const menuType = getMenuType(item);
                          const supplierName = getSupplierName(item);

                          return (
                            <div key={item._id || index} className="flex gap-4 p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-200 transition-all">
                              {/* Item Image */}
                              <div className="flex-shrink-0 relative">
                                <ImageWithFallback 
                                  src={imageUrl}
                                  alt={itemName}
                                  className="w-20 h-20 rounded-xl object-cover border-2 border-gray-100"
                                  item={item}
                                />
                                {/* Veg/Non-Veg Badge */}
                                <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${
                                  menuType.toLowerCase() === 'veg' 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-rose-500 text-white'
                                }`}>
                                  {menuType.toLowerCase() === 'veg' ? 'V' : 'N'}
                                </div>
                              </div>

                              {/* Item Details */}
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg truncate">{itemName}</h4>
                                    <p className="text-sm text-gray-600 truncate">by {supplierName}</p>
                                  </div>
                                  <div className="text-right ml-2">
                                    <span className="font-bold text-gray-900 text-lg">₹{itemTotal}</span>
                                    <div className="text-xs text-gray-500 mt-1">
                                      ₹{itemPrice} × {itemQuantity}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    menuType.toLowerCase() === 'veg' 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                      menuType.toLowerCase() === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}></div>
                                    {menuType}
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(currentOrder.billing?.payment_status)}`}>
                                    {currentOrder.billing?.payment_status || 'Pending'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Order Summary */}
                        <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-100">
                          <h4 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Order Status</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentOrder.order_status)}`}>
                                  {currentOrder.order_status}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(currentOrder.billing?.payment_status)}`}>
                                  {currentOrder.billing?.payment_status || 'Pending'}
                                </span>
                              </div>
                              {currentOrder.billing?.payment_mode && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Payment Method</span>
                                  <span className="font-medium text-gray-900">{currentOrder.billing.payment_mode}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Items Total</span>
                                <span className="font-bold text-gray-900 text-lg">₹{currentOrder.totalAmount || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Order Date</span>
                                <span className="font-medium text-gray-900">{formatDate(currentOrder.order_date)}</span>
                              </div>
                              {currentOrder.billing?.bill_date && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Billing Date</span>
                                  <span className="font-medium text-gray-900">{formatDate(currentOrder.billing.bill_date)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">🍽️</div>
                        <p className="text-xl mb-2">No items in this order</p>
                        <p className="text-gray-400">Items will appear here once added</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : !loading && orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-8xl mb-6">🛒</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start your culinary journey with our delicious menu options
                  </p>
                  <button 
                    onClick={() => window.location.href = '/menu'}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    Explore Menu
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
}

export default Category;