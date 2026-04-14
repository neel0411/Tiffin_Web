import React, { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://tiffin-web-so1c.onrender.com/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || "admin-token";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ManageMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states for each column
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    supplier: "all", 
    status: "all",
    priceRange: "all"
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Extract unique values for filter options
  const categories = [...new Set(menuItems.map(item => item.cat_id?.cat_name).filter(Boolean))];
  const suppliers = [...new Set(menuItems.map(item => item.supplier_id?.company_name || item.supplier_id?.name).filter(Boolean))];

  const fetchRealMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/menu");
      
      if (response.data && Array.isArray(response.data)) {
        setMenuItems(response.data);
        setFilteredItems(response.data);
      } else {
        throw new Error("Invalid data format from API");
      }
      
    } catch (err) {
      console.error("❌ Error fetching real menu:", err);
      
      let errorMessage = "Failed to load menu items";
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'No data received'}`;
      } else if (err.request) {
        errorMessage = "Cannot connect to server. Make sure backend is running on port 5000";
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      
      setError(errorMessage);
      setMenuItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...menuItems];

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(item => item.menu_type === filters.type);
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(item => item.cat_id?.cat_name === filters.category);
    }

    // Supplier filter
    if (filters.supplier !== "all") {
      filtered = filtered.filter(item => 
        (item.supplier_id?.company_name || item.supplier_id?.name) === filters.supplier
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(item => 
        filters.status === "active" ? item.is_active : !item.is_active
      );
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter(item => {
        const price = item.menu_price;
        switch (filters.priceRange) {
          case "under100": return price < 100;
          case "100-200": return price >= 100 && price <= 200;
          case "200-500": return price >= 200 && price <= 500;
          case "over500": return price > 500;
          default: return true;
        }
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested objects
        if (sortConfig.key === 'cat_id') {
          aValue = a.cat_id?.cat_name;
          bValue = b.cat_id?.cat_name;
        } else if (sortConfig.key === 'supplier_id') {
          aValue = a.supplier_id?.company_name || a.supplier_id?.name;
          bValue = b.supplier_id?.company_name || b.supplier_id?.name;
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

    setFilteredItems(filtered);
  }, [menuItems, filters, sortConfig]);

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
      type: "all",
      category: "all",
      supplier: "all",
      status: "all",
      priceRange: "all"
    });
    setSortConfig({ key: null, direction: 'asc' });
  };

  const activeFilterCount = Object.values(filters).filter(value => value !== "all").length;

  useEffect(() => {
    fetchRealMenu();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
        <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">View Menu</h1>
            <p className="text-gray-600 mt-2">Loading menu from database...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading real menu data...</div>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">View Menu</h1>
          <p className="text-gray-600 mt-2">
            Real database menu ({filteredItems.length} of {menuItems.length} items)
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
            onClick={fetchRealMenu}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Menu</span>
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
              onClick={fetchRealMenu}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors shadow-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-2xl font-bold text-blue-600">{filteredItems.length}</div>
          <div className="text-sm text-gray-600 mt-1">Showing Items</div>
          <div className="text-xs text-green-600 mt-1">Live Database</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-2xl font-bold text-green-600">
            {filteredItems.filter(item => item.menu_type === "Veg").length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Veg Items</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-2xl font-bold text-red-600">
            {filteredItems.filter(item => item.menu_type === "Non-Veg").length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Non-Veg</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-2xl font-bold text-purple-600">
            {filteredItems.filter(item => item.is_active).length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Active Items</div>
        </div>
      </div>

      {/* Menu Table with Built-in Filters - Fixed Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-600">
              {menuItems.length === 0 ? "No Menu Items in Database" : "No Items Found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {menuItems.length === 0 
                ? "No menu records found in your MongoDB database." 
                : "No items match your current filters."
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
                onClick={fetchRealMenu}
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
                  <th className="w-16 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="w-48 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <button 
                        onClick={() => handleSort('menu_name')}
                        className="text-gray-400 hover:text-gray-600 text-xl p-3"
                      >
                        {sortConfig.key === 'menu_name' ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : '↕'}
                      </button>
                    </div>
                  </th>
                  
                  {/* Type Column with Filter */}
                  <th className="w-32 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col space-y-1">
                      <span>Type</span>
                      <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange("type", e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Types</option>
                        <option value="Veg">Veg</option>
                        <option value="Non-Veg">Non-Veg</option>
                      </select>
                    </div>
                  </th>

                  {/* Category Column with Filter */}
                  <th className="w-40 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col space-y-1">
                      <span>Category</span>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </th>

                  {/* Supplier Column with Filter */}
                  <th className="w-40 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col space-y-1">
                      <span>Supplier</span>
                      <select
                        value={filters.supplier}
                        onChange={(e) => handleFilterChange("supplier", e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Suppliers</option>
                        {suppliers.map(supplier => (
                          <option key={supplier} value={supplier}>{supplier}</option>
                        ))}
                      </select>
                    </div>
                  </th>

                  {/* Price Column with Filter */}
                  <th className="w-32 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col space-y-1">
                      <span>Price</span>
                      <select
                        value={filters.priceRange}
                        onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Prices</option>
                        <option value="under100">Under ₹100</option>
                        <option value="100-200">₹100-200</option>
                        <option value="200-500">₹200-500</option>
                        <option value="over500">Over ₹500</option>
                      </select>
                    </div>
                  </th>

                  {/* Status Column with Filter */}
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
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-3 py-3 whitespace-nowrap">
                      {item.menu_image ? (
                        <img 
                          src={`https://tiffin-web-so1c.onrender.com${item.menu_image}`} 
                          alt={item.menu_name} 
                          className="h-10 w-10 object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-gray-900 text-sm">{item.menu_name}</div>
                      {item.menu_desc && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{item.menu_desc}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        item.menu_type === "Veg" 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        {item.menu_type}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                        {item.cat_id?.cat_name || "N/A"}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {item.supplier_id?.company_name || item.supplier_id?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-bold text-gray-900 text-sm">₹{item.menu_price}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        item.is_active 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
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
          Showing {filteredItems.length} of {menuItems.length} items
          {activeFilterCount > 0 && (
            <span className="text-blue-600 font-semibold"> • {activeFilterCount} filter(s) applied</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ManageMenu;