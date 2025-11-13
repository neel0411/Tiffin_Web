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

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchRealCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/customers");
      
      if (response.data && Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        throw new Error("Invalid data format from API");
      }
      
    } catch (err) {
      console.error("❌ Error fetching real customers:", err);
      
      let errorMessage = "Failed to load customers";
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'No data received'}`;
      } else if (err.request) {
        errorMessage = "Cannot connect to server. Make sure backend is running on port 5000";
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      
      setError(errorMessage);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealCustomers();
  }, []);

  const toggleBlockCustomer = async (customerId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "blocked" : "active";
      
      const response = await api.patch(`/customers/${customerId}/block`);
      
      if (response.data.customer) {
        setCustomers(prev =>
          prev.map(customer =>
            customer._id === customerId 
              ? { ...customer, status: response.data.customer.status }
              : customer
          )
        );
      } else {
        setCustomers(prev =>
          prev.map(customer =>
            customer._id === customerId 
              ? { ...customer, status: newStatus }
              : customer
          )
        );
      }
      
    } catch (err) {
      console.error("❌ Error toggling block status:", err);
      setError(`Failed to update customer: ${err.response?.data?.message || err.message}`);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (filter === "all") return true;
    if (filter === "active") return customer.status === "active";
    if (filter === "blocked") return customer.status === "blocked";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "blocked":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const formatStatus = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manage Customers</h1>
            <p className="text-gray-600 mt-2">Connecting to database...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading real customer data...</div>
            <div className="text-sm text-gray-500">Fetching from MongoDB</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header Section with Refresh Button */}
      <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manage Customers</h1>
          <p className="text-gray-600 mt-2">
            Real database customers ({customers.length} loaded)
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 md:mt-0">
          <button
            onClick={fetchRealCustomers}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm">Refresh from Database</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
              <p className="text-red-800 font-semibold text-sm">Database Connection Issue</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={fetchRealCustomers}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Customers</div>
          <div className="text-xs text-green-600 mt-1">Live Database</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-green-600">
            {customers.filter(customer => customer.status === "active").length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-red-600">
            {customers.filter(customer => customer.status === "blocked").length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Blocked</div>
        </div>
      
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`pb-3 px-1 whitespace-nowrap border-b-2 transition-colors ${
            filter === "all" 
              ? "border-blue-500 text-blue-600 font-medium" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All ({customers.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`pb-3 px-1 whitespace-nowrap border-b-2 transition-colors ${
            filter === "active" 
              ? "border-green-500 text-green-600 font-medium" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Active ({customers.filter(c => c.status === "active").length})
        </button>
        <button
          onClick={() => setFilter("blocked")}
          className={`pb-3 px-1 whitespace-nowrap border-b-2 transition-colors ${
            filter === "blocked" 
              ? "border-red-500 text-red-600 font-medium" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Blocked ({customers.filter(c => c.status === "blocked").length})
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-600">No Customers in Database</h3>
            <p className="text-gray-500 mb-4">No customer records found in your MongoDB database.</p>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded inline-block text-left max-w-md">
              <p className="text-yellow-800 text-sm">
                <strong>Possible reasons:</strong>
                <br/>• No customers have registered yet
                <br/>• Database connection issue
                <br/>• API endpoint not configured properly
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="hidden sm:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{customer.name}</div>
                        <div className="sm:hidden text-xs text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 lg:px-6 py-4">
                      <div className="text-gray-600 text-sm">{customer.email}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {formatStatus(customer.status)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-4 lg:px-6 py-4">
                      <div className="text-gray-600 text-sm">{customer.phone || "Not provided"}</div>
                    </td>
                    <td className="hidden lg:table-cell px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.createdAt 
                        ? new Date(customer.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : "N/A"
                      }
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleBlockCustomer(customer._id, customer.status)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          customer.status === "active"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {customer.status === "active" ? "Block" : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCustomers;