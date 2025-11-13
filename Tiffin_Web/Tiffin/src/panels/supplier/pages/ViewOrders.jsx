import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { orderAPI } from "../../../services/api";
import { toast } from "react-hot-toast";

function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [stats, setStats] = useState(null);

  // Status options
  const orderStatusOptions = ['Pending', 'In Progress', 'Delivered', 'Cancelled'];
  const paymentStatusOptions = ['Pending', 'Success', 'Failed'];

  // Helper function to safely get menu item name - optimized
  const getMenuItemName = (item) => {
    if (!item) return 'Unknown Item';
    
    // Quick check without console.log for performance
    if (item.menu_id && typeof item.menu_id === 'object') {
      return item.menu_id.menu_name || item.menu_id.name || item.menu_id.title || 'Menu Item';
    }
    
    if (typeof item.menu_id === 'string') {
      return 'Loading...';
    }
    
    return item.name || 'Unknown Item';
  };

  // Fetch current supplier profile - cached
  const fetchCurrentSupplier = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentSupplier(user);
        return user;
      }
    } catch (error) {
      console.error("❌ Error fetching supplier data:", error);
    }
    return null;
  };

  // Fetch supplier stats with timeout
  const fetchSupplierStats = async () => {
    try {
      const statsResponse = await Promise.race([
        orderAPI.getSupplierStats(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Stats timeout")), 5000)
        )
      ]);
      setStats(statsResponse.data.stats);
    } catch (err) {
      console.error("❌ Error fetching stats:", err);
      // Don't show toast for stats failure, use fallback
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.order_status === 'Pending').length,
        inProgressOrders: orders.filter(o => o.order_status === 'In Progress').length,
        deliveredOrders: orders.filter(o => o.order_status === 'Delivered').length
      });
    }
  };

  // Fetch orders with optimized error handling
  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log("🔄 Fetching supplier orders...");
      
      const supplier = fetchCurrentSupplier();
      
      if (!supplier || supplier.role !== 'supplier') {
        toast.error("Supplier access required");
        return;
      }

      // Add timeout to prevent hanging
      const ordersPromise = Promise.race([
        orderAPI.getSupplierOrders(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Request timeout")), 10000)
        )
      ]);

      const res = await ordersPromise;
      console.log("✅ Orders fetched successfully");
      
      setOrders(res.data || []);
      
      // Fetch stats separately without blocking UI
      fetchSupplierStats();
      
      if (isRefresh) {
        toast.success("Orders updated!");
      }

    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      
      if (err.message === "Request timeout") {
        toast.error("Request timeout - Please check your connection");
      } else if (err.response?.status === 403) {
        toast.error("Access denied. Supplier role required.");
      } else if (err.response?.status === 401) {
        toast.error("Please login again");
      } else {
        toast.error("Failed to load orders. Please try again.");
      }
      
      // Use cached data if available
      if (orders.length === 0) {
        setOrders([]); // Show empty state
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Optimized status update with immediate UI feedback
  const updateOrderStatus = async (orderId, newStatus) => {
    const originalOrders = [...orders];
    
    try {
      // Optimistic update
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, order_status: newStatus }
          : order
      ));

      await orderAPI.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated");
      
      // Refresh stats after successful update
      fetchSupplierStats();
      
    } catch (err) {
      // Revert on error
      setOrders(originalOrders);
      console.error("❌ Error updating order status:", err);
      
      if (err.response?.status === 403) {
        toast.error("You can only update your own orders");
      } else {
        toast.error("Failed to update order status");
      }
    }
  };

  // Optimized payment status update
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    const originalOrders = [...orders];
    
    try {
      // Optimistic update
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              billing: { 
                ...order.billing, 
                payment_status: newPaymentStatus 
              } 
            }
          : order
      ));

      await orderAPI.updatePaymentStatus(orderId, newPaymentStatus);
      toast.success("Payment status updated");
      
    } catch (err) {
      // Revert on error
      setOrders(originalOrders);
      console.error("❌ Error updating payment status:", err);
      toast.error("Failed to update payment status");
    }
  };

  // Delete Order with optimistic update
  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    
    const originalOrders = [...orders];
    
    try {
      // Optimistic update
      setOrders(prev => prev.filter(order => order._id !== id));
      
      await orderAPI.deleteOrder(id);
      toast.success("Order deleted successfully");
      
      // Refresh stats
      fetchSupplierStats();
      
    } catch (err) {
      // Revert on error
      setOrders(originalOrders);
      console.error("❌ Error deleting order:", err);
      
      if (err.response?.status === 403) {
        toast.error("You can only delete your own orders");
      } else {
        toast.error("Failed to delete order");
      }
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-800 border-green-200';
      case 'Failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  // Calculate stats from orders as fallback
  const calculateFallbackStats = (orders) => {
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.order_status === 'Pending').length,
      inProgressOrders: orders.filter(o => o.order_status === 'In Progress').length,
      deliveredOrders: orders.filter(o => o.order_status === 'Delivered').length
    };
  };

  const displayStats = stats || calculateFallbackStats(orders);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-64">
          <Sidebar />
        </div>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-gray-600 font-medium">Loading your orders...</p>
            <p className="text-sm text-gray-500">This may take a few seconds</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">
                Managing orders for <span className="font-semibold text-blue-600">{currentSupplier?.name || 'Your Restaurant'}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Only showing orders containing your menu items
              </p>
            </div>
            <button 
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {refreshing ? (
            // Skeleton loading for stats
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{displayStats.totalOrders}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{displayStats.pendingOrders}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{displayStats.inProgressOrders}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl">🔄</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-green-600">{displayStats.deliveredOrders}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Orders for Your Restaurant</h2>
            <p className="text-sm text-gray-600">
              Showing {orders.length} orders • Only your restaurant's items are visible
              {refreshing && <span className="ml-2 text-orange-600">🔄 Updating...</span>}
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Orders will appear here when customers order from your menu.</p>
              <button 
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Check for New Orders
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer & Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Order #{order._id?.slice(-8)?.toUpperCase() || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Date not available'}
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            Your Total: ₹{order.supplier_total || 0}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-900">
                            {order.customer_id?.name || 'Unknown Customer'}
                          </p>
                          <div className="text-sm text-gray-600">
                            {order.items && order.items.length > 0 ? (
                              <div className="space-y-1">
                                {order.items.slice(0, 3).map((item, index) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="truncate max-w-[120px] font-medium">
                                      {getMenuItemName(item)}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      x{item.qty} • ₹{item.price}
                                    </span>
                                  </div>
                                ))}
                                {order.items.length > 3 && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    +{order.items.length - 3} more items
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">No items</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`text-sm font-medium px-3 py-2 rounded-lg border-2 transition duration-200 cursor-pointer ${getStatusColor(order.order_status)}`}
                        >
                          {orderStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.billing ? (
                          <div className="space-y-2">
                            <select
                              value={order.billing.payment_status}
                              onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                              className={`text-sm font-medium px-3 py-2 rounded-lg border-2 cursor-pointer ${getPaymentStatusColor(order.billing.payment_status)}`}
                            >
                              {paymentStatusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500">
                              {order.billing.payment_mode}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">No billing</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
                          title="Delete Order"
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {orders.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {orders.length} orders containing your items • Last updated: {new Date().toLocaleTimeString()}
              {refreshing && <span className="ml-2 text-orange-600">• Updating...</span>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewOrders;