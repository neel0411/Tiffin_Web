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

const ManageSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchRealSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/supplier");
      
      if (response.data && Array.isArray(response.data)) {
        setSuppliers(response.data);
      } else {
        throw new Error("Invalid data format");
      }
      
    } catch (err) {
      console.error("❌ Error:", err);
      let errorMessage = "Failed to load suppliers";
      
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message}`;
      } else if (err.request) {
        errorMessage = "Cannot connect to server";
      }
      
      setError(errorMessage);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealSuppliers();
  }, []);

  const toggleBlockSupplier = async (supplierId, currentStatus, supplierName) => {
    try {
      const response = await api.patch(`/supplier/${supplierId}/block`);
      
      if (response.data.supplier) {
        setSuppliers(prev =>
          prev.map(supplier =>
            supplier._id === supplierId 
              ? { ...supplier, status: response.data.supplier.status }
              : supplier
          )
        );
        
        const newStatus = response.data.supplier.status;
        setSuccess(`Supplier ${supplierName} ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully!`);
        setTimeout(() => setSuccess(""), 3000);
      }
      
    } catch (err) {
      console.error("❌ Block error:", err);
      setError(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    if (filter === "all") return true;
    if (filter === "active") return supplier.status === "active";
    if (filter === "blocked") return supplier.status === "blocked";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border border-green-200";
      case "blocked": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manage Suppliers</h1>
          <p className="text-gray-600 mt-2">Loading suppliers...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Fetching from database...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manage Suppliers</h1>
        <p className="text-gray-600 mt-2">
          Real database suppliers ({suppliers.length} loaded)
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <p className="text-green-800 font-semibold text-sm">✅ {success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
              <p className="text-red-800 font-semibold text-sm">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={fetchRealSuppliers}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-blue-600">{suppliers.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Suppliers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-green-600">
            {suppliers.filter(s => s.status === "active").length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-red-600">
            {suppliers.filter(s => s.status === "blocked").length}
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
          All ({suppliers.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`pb-3 px-1 whitespace-nowrap border-b-2 transition-colors ${
            filter === "active" 
              ? "border-green-500 text-green-600 font-medium" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Active ({suppliers.filter(s => s.status === "active").length})
        </button>
        <button
          onClick={() => setFilter("blocked")}
          className={`pb-3 px-1 whitespace-nowrap border-b-2 transition-colors ${
            filter === "blocked" 
              ? "border-red-500 text-red-600 font-medium" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Blocked ({suppliers.filter(s => s.status === "blocked").length})
        </button>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {suppliers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold text-gray-600">No Suppliers Found</h3>
            <p className="text-gray-500 mb-4">Your database is empty</p>
            <button 
              onClick={fetchRealSuppliers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="hidden sm:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{supplier.company_name || supplier.name}</div>
                        <div className="sm:hidden text-xs text-gray-500">{supplier.email}</div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 lg:px-6 py-4">
                      <div className="text-gray-600 text-sm">{supplier.email}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(supplier.status)}`}>
                        {supplier.status ? supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1) : "Unknown"}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-4 lg:px-6 py-4">
                      <div className="text-gray-600 text-sm">{supplier.phone || "Not provided"}</div>
                    </td>
                    <td className="hidden lg:table-cell px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {supplier.createdAt 
                        ? new Date(supplier.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : "N/A"
                      }
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleBlockSupplier(supplier._id, supplier.status, supplier.name)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          supplier.status === "active"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {supplier.status === "active" ? "Block" : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 lg:mt-8 flex justify-end">
        <button
          onClick={fetchRealSuppliers}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <span className="text-sm">Refresh Suppliers</span>
        </button>
      </div>
    </div>
  );
};

export default ManageSuppliers;