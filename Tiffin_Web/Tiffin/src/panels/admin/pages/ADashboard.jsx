import React, { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://tiffin-web-so1c.onrender.com/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || "admin-token";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function ADashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalSuppliers: 0,
    ordersToday: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    activeOrders: 0,
    totalMenuItems: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    cancelledOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        customersResponse, 
        suppliersResponse, 
        ordersResponse, 
        billingResponse, 
        menuResponse
      ] = await Promise.all([
        api.get("/admin/customers?countOnly=true").catch(() => ({ data: { count: 0 } })),
        api.get("/admin/suppliers?countOnly=true").catch(() => ({ data: { count: 0 } })),
        api.get("/orders").catch(async (err) => {
          try {
            const altResponse = await api.get("/admin/orders");
            return altResponse;
          } catch {
            return { data: [] };
          }
        }),
        api.get("/billing").catch(() => ({ data: [] })),
        api.get("/menu").catch(() => ({ data: [] }))
      ]);

      const customersCount = customersResponse?.data?.count || 0;
      const suppliersCount = suppliersResponse?.data?.count || 0;
      const orders = ordersResponse?.data || [];
      const bills = billingResponse?.data || [];
      const menuItems = menuResponse?.data || [];

      const orderStats = calculateOrderStats(orders);

      const successfulBills = bills.filter(bill => bill.payment_status === 'Success');
      const pendingBills = bills.filter(bill => bill.payment_status === 'Pending');
      const totalRevenue = successfulBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
      const pendingPayments = pendingBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);

      const recentOrdersData = orders
        .sort((a, b) => new Date(b.order_date || b.createdAt) - new Date(a.order_date || a.createdAt))
        .slice(0, 5);

      setStats({
        totalCustomers: customersCount,
        totalSuppliers: suppliersCount,
        ordersToday: orderStats.ordersToday,
        pendingPayments,
        totalRevenue,
        activeOrders: orderStats.activeOrders,
        totalMenuItems: menuItems.length,
        totalOrders: orderStats.totalOrders,
        deliveredOrders: orderStats.deliveredOrders,
        pendingOrders: orderStats.pendingOrders,
        inProgressOrders: orderStats.inProgressOrders,
        cancelledOrders: orderStats.cancelledOrders
      });

      setRecentOrders(recentOrdersData);

    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateOrderStats = (orders) => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return {
        totalOrders: 0,
        deliveredOrders: 0,
        pendingOrders: 0,
        inProgressOrders: 0,
        cancelledOrders: 0,
        ordersToday: 0,
        activeOrders: 0
      };
    }

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(order => order.order_status === 'Delivered').length;
    const pendingOrders = orders.filter(order => order.order_status === 'Pending').length;
    const inProgressOrders = orders.filter(order => order.order_status === 'In Progress').length;
    const cancelledOrders = orders.filter(order => order.order_status === 'Cancelled').length;
    
    const today = new Date();
    const todayString = today.toDateString();
    const ordersToday = orders.filter(order => {
      if (!order.order_date && !order.createdAt) return false;
      const orderDate = new Date(order.order_date || order.createdAt);
      return orderDate.toDateString() === todayString;
    }).length;

    const activeOrders = pendingOrders + inProgressOrders;

    return {
      totalOrders,
      deliveredOrders,
      pendingOrders,
      inProgressOrders,
      cancelledOrders,
      ordersToday,
      activeOrders
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Page Title */}
      <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
  <div>
    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome back, Administrator! 👋</p>
  </div>

  {/* Refresh Button */}
  <div className="mt-4 md:mt-0">
    <button
      onClick={fetchDashboardData}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span className="text-sm">Refresh Data</span>
    </button>
  </div>
</div>



      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-sm">{error}</span>
            <button 
              onClick={fetchDashboardData}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500 mt-1">All orders in system</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-600 text-2xl">📦</div>
            </div>
          </div>
        </div>

        {/* Orders Today */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Orders Today</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.ordersToday}</p>
              <p className="text-sm text-gray-500 mt-1">Placed today</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-600 text-2xl">📅</div>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Active Orders</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeOrders}</p>
              <p className="text-sm text-gray-500 mt-1">Pending + In Progress</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-orange-600 text-2xl">⚡</div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-600 mt-1">Customers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-indigo-600">{stats.totalSuppliers}</div>
          <div className="text-sm text-gray-600 mt-1">Suppliers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-teal-600">{stats.totalMenuItems}</div>
          <div className="text-sm text-gray-600 mt-1">Menu Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
          <div className="text-sm text-gray-600 mt-1">Revenue</div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 lg:mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="font-bold text-green-700 text-xl">{stats.deliveredOrders}</div>
            <div className="text-sm text-green-600 mt-1">Delivered</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="font-bold text-blue-700 text-xl">{stats.inProgressOrders}</div>
            <div className="text-sm text-blue-600 mt-1">In Progress</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="font-bold text-yellow-700 text-xl">{stats.pendingOrders}</div>
            <div className="text-sm text-yellow-600 mt-1">Pending</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="font-bold text-red-700 text-xl">{stats.cancelledOrders}</div>
            <div className="text-sm text-red-600 mt-1">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
          <p className="text-gray-600 text-sm mt-1">Latest {recentOrders.length} orders</p>
        </div>
        <div className="p-6">
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden sm:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(order.order_date || order.createdAt)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.customer_id?.name || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-lg">No recent orders found</p>
              <p className="text-sm mt-2">Orders will appear here as they are placed</p>
            </div>
          )}
        </div>
      </div>

   
    </div>
  );
}

export default ADashboard;