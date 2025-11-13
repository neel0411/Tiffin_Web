import React, { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || "admin-token";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states for each column
  const [filters, setFilters] = useState({
    status: "all",
    method: "all",
    dateRange: "all",
    amountRange: "all"
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchRealPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/billing");
      
      if (response.data && Array.isArray(response.data)) {
        setPayments(response.data);
        setFilteredPayments(response.data);
      } else {
        throw new Error("Invalid data format from API");
      }
      
    } catch (err) {
      console.error("❌ Error fetching real payments:", err);
      
      let errorMessage = "Failed to load payments";
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'No data received'}`;
      } else if (err.request) {
        errorMessage = "Cannot connect to server. Make sure backend is running on port 5000";
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      
      setError(errorMessage);
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...payments];

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(payment => payment.payment_status === filters.status);
    }

    // Method filter
    if (filters.method !== "all") {
      filtered = filtered.filter(payment => payment.payment_mode === filters.method);
    }

    // Amount range filter
    if (filters.amountRange !== "all") {
      filtered = filtered.filter(payment => {
        const amount = payment.total_amount || 0;
        switch (filters.amountRange) {
          case "under500": return amount < 500;
          case "500-1000": return amount >= 500 && amount <= 1000;
          case "1000-2000": return amount >= 1000 && amount <= 2000;
          case "over2000": return amount > 2000;
          default: return true;
        }
      });
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.bill_date || payment.createdAt);
        const diffTime = Math.abs(now - paymentDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case "today": return diffDays <= 1;
          case "week": return diffDays <= 7;
          case "month": return diffDays <= 30;
          default: return true;
        }
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'total_amount') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (sortConfig.key === 'bill_date' || sortConfig.key === 'createdAt') {
          aValue = new Date(a.bill_date || a.createdAt);
          bValue = new Date(b.bill_date || b.createdAt);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Default sort by latest payments if no sort config
    if (!sortConfig.key) {
      filtered.sort((a, b) => new Date(b.bill_date || b.createdAt) - new Date(a.bill_date || a.createdAt));
    }

    setFilteredPayments(filtered);
  }, [payments, filters, sortConfig]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearAllFilters = () => {
    setFilters({
      status: "all",
      method: "all",
      dateRange: "all",
      amountRange: "all"
    });
    setSortConfig({ key: null, direction: 'asc' });
  };

  const activeFilterCount = Object.values(filters).filter(value => value !== "all").length;

  // Calculate totals based on filtered payments
  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const pendingPayments = filteredPayments.filter((p) => p.payment_status === "Pending").length;
  const completedPayments = filteredPayments.filter((p) => p.payment_status === "Success").length;
  const failedPayments = filteredPayments.filter((p) => p.payment_status === "Failed").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "Success":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Failed":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "UPI":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Card":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "COD":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Extract unique values for filter options
  const paymentStatuses = [...new Set(payments.map(payment => payment.payment_status).filter(Boolean))];
  const paymentMethods = [...new Set(payments.map(payment => payment.payment_mode).filter(Boolean))];

  useEffect(() => {
    fetchRealPayments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
        <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">View Payments</h1>
            <p className="text-gray-600 mt-2">Loading payments from database...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading real payment data...</div>
            <div className="text-sm text-gray-500">Fetching from MongoDB</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
      {/* Header Section */}
      <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">View Payments</h1>
          <p className="text-gray-600 mt-2">
            Real database payments ({filteredPayments.length} of {payments.length} payments)
            {activeFilterCount > 0 && (
              <span className="text-blue-600 font-semibold"> • {activeFilterCount} filter(s) active</span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear Filters</span>
            </button>
          )}
          <button
            onClick={fetchRealPayments}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Payments</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
              <p className="text-red-800 font-semibold text-sm">Database Connection Issue</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={fetchRealPayments}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors shadow-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-2xl font-bold text-blue-600">₹{totalAmount}</div>
          <div className="text-sm text-gray-600 mt-1">Total Amount</div>
          <div className="text-xs text-green-600 mt-1">Live Database</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-2xl font-bold text-green-600">{completedPayments}</div>
          <div className="text-sm text-gray-600 mt-1">Success</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-2xl font-bold text-yellow-600">{pendingPayments}</div>
          <div className="text-sm text-gray-600 mt-1">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-2xl font-bold text-red-600">{failedPayments}</div>
          <div className="text-sm text-gray-600 mt-1">Failed</div>
        </div>
      </div>

      {/* Payment Table with Built-in Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-gray-600">
              {payments.length === 0 ? "No Payments in Database" : "No Payments Found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {payments.length === 0 
                ? "No payment records found in your MongoDB database." 
                : "No payments match your current filters."
              }
            </p>
            <div className="flex justify-center gap-3">
              {activeFilterCount > 0 && (
                <button 
                  onClick={clearAllFilters}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
              )}
              <button 
                onClick={fetchRealPayments}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Refresh Data
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  {/* Order ID - Only Sort */}
                  <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Order ID</span>
                    </div>
                  </th>

                  {/* Amount - With Filter and Sort */}
                  <th className="w-32 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col space-y-1">
                      <span>Amount ₹</span>
                      <select
                        value={filters.amountRange}
                        onChange={(e) => handleFilterChange("amountRange", e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Amounts</option>
                        <option value="under500">Under ₹500</option>
                        <option value="500-1000">₹500-1000</option>
                        <option value="1000-2000">₹1000-2000</option>
                        <option value="over2000">Over ₹2000</option>
                      </select>
                    </div>
                  </th>

                  {/* Method - With Filter */}
                  <th className="w-28 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col space-y-1">
                      <span>Method</span>
                      <select
                        value={filters.method}
                        onChange={(e) => handleFilterChange("method", e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Methods</option>
                        {paymentMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                  </th>

                  {/* Status - With Filter */}
                  <th className="w-28 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col space-y-1">
                      <span>Status</span>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Status</option>
                        {paymentStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </th>

                  {/* Date - With Filter and Sort */}
                  <th className="w-36 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Date</span>
                        <button 
                          onClick={() => handleSort('bill_date')}
                          className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                          {sortConfig.key === 'bill_date' ? (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          ) : '↕'}
                        </button>
                      </div>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900 text-sm">
                        #{payment.order_id?._id?.slice(-6) || payment.order_id?.slice(-6) || payment._id?.slice(-6)}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-bold text-gray-900 text-sm">₹{payment.total_amount}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${getMethodColor(payment.payment_mode)}`}>
                        {payment.payment_mode}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(payment.payment_status)}`}>
                        {payment.payment_status}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600">
                      {payment.bill_date 
                        ? new Date(payment.bill_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : "N/A"
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table Info Footer */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Showing {filteredPayments.length} of {payments.length} payments
          {activeFilterCount > 0 && (
            <span className="text-blue-600 font-semibold"> • {activeFilterCount} filter(s) applied</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ManagePayments;