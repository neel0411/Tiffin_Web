// Menu.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../services/api";

const Menu = ({ onAddToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [vegFilter, setVegFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://tiffin-web-so1c.onrender.com";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads/")) return `${baseUrl}${imagePath}`;
    return `${baseUrl}/uploads/menu/${imagePath}`;
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get("/menu");
      setMenuItems(res.data);
      setFilteredItems(res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = menuItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.menu_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter - FIXED
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.cat_id && item.cat_id._id === selectedCategory);
    }

    // Price range filter
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under100":
          filtered = filtered.filter(item => item.menu_price < 100);
          break;
        case "100to200":
          filtered = filtered.filter(item => item.menu_price >= 100 && item.menu_price <= 200);
          break;
        case "200plus":
          filtered = filtered.filter(item => item.menu_price > 200);
          break;
        default:
          break;
      }
    }

    // Veg/Non-veg filter
    if (vegFilter !== "all") {
      filtered = filtered.filter(item => 
        item.menu_type.toLowerCase() === vegFilter
      );
    }

    // Sort
    switch (sortBy) {
      case "priceLow":
        filtered = [...filtered].sort((a, b) => a.menu_price - b.menu_price);
        break;
      case "priceHigh":
        filtered = [...filtered].sort((a, b) => b.menu_price - a.menu_price);
        break;
      case "name":
        filtered = [...filtered].sort((a, b) => a.menu_name.localeCompare(b.menu_name));
        break;
      default:
        break;
    }

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, priceRange, vegFilter, sortBy, menuItems]);

  const handleAddToCart = async (item) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("⚠️ Please login first!");
      return;
    }
    try {
      await api.post("/cart", { menu_id: item._id });
      toast.success(`✅ ${item.menu_name} added to Tiffin!`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add to Tiffin.");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange("all");
    setVegFilter("all");
    setSortBy("name");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen pt-24 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-xl text-slate-600 font-medium">Loading menu...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen pt-24">
        {/* Google Style Search Bar - Sticky in Mobile */}
        <div className="sticky top-20 z-30 bg-gradient-to-br from-slate-50 to-blue-50 pt-4 pb-2 lg:pt-0 lg:pb-0 lg:bg-transparent lg:relative lg:top-auto lg:z-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-2 lg:mb-6 lg:mt-6">
            <div className="bg-white rounded-full shadow-lg border border-slate-200 p-1 lg:shadow-lg">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search dishes, cuisines, or items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-full border-0 focus:ring-0 focus:outline-none placeholder-slate-400"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex flex-col lg:flex-row gap-0">
          {/* Mobile Filters Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-40">
              {/* Blur Background */}
              <div 
                className="absolute inset-0 bg-black/10 backdrop-blur-sm" 
                onClick={() => setShowFilters(false)}
              />
              
              {/* Filter Panel */}
              <div className="absolute right-0 top-0 h-full w-64 bg-white/95 backdrop-blur-sm p-4 overflow-y-auto border-l border-slate-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-slate-500 hover:text-slate-700 p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Mobile Filter Content */}
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2 text-sm">Category</h4>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all duration-300"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.cat_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2 text-sm">Price Range</h4>
                    <div className="space-y-1">
                      {[
                        { value: "all", label: "All Prices" },
                        { value: "under100", label: "Under ₹100" },
                        { value: "100to200", label: "₹100 - ₹200" },
                        { value: "200plus", label: "Above ₹200" }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="price"
                            value={option.value}
                            checked={priceRange === option.value}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="mr-2 text-cyan-500 focus:ring-cyan-500 w-3 h-3"
                          />
                          <span className="text-slate-600 text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Veg/Non-Veg Filter */}
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2 text-sm">Food Type</h4>
                    <div className="space-y-1">
                      {[
                        { value: "all", label: "Both" },
                        { value: "veg", label: "Pure Veg" },
                        { value: "non-veg", label: "Non Veg" }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="veg"
                            value={option.value}
                            checked={vegFilter === option.value}
                            onChange={(e) => setVegFilter(e.target.value)}
                            className="mr-2 text-cyan-500 focus:ring-cyan-500 w-3 h-3"
                          />
                          <span className="text-slate-600 text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2 text-sm">Sort By</h4>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all duration-300"
                    >
                      <option value="name">Name (A to Z)</option>
                      <option value="priceLow">Price: Low to High</option>
                      <option value="priceHigh">Price: High to Low</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={clearFilters}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-60 flex-shrink-0 pr-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-3 sticky top-28 border border-slate-200 mr-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  Clear all
                </button>
              </div>
              
              {/* Category Filter */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-700 mb-2 text-sm">Category</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all duration-300"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.cat_name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-700 mb-2 text-sm">Price Range</h4>
                <div className="space-y-1">
                  {[
                    { value: "all", label: "All Prices" },
                    { value: "under100", label: "Under ₹100" },
                    { value: "100to200", label: "₹100 - ₹200" },
                    { value: "200plus", label: "Above ₹200" }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="mr-2 text-cyan-500 focus:ring-cyan-500 w-3 h-3"
                      />
                      <span className="text-slate-600 text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Veg/Non-Veg Filter */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-700 mb-2 text-sm">Food Type</h4>
                <div className="space-y-1">
                  {[
                    { value: "all", label: "Both Veg & Non-Veg" },
                    { value: "veg", label: "Pure Veg" },
                    { value: "non-veg", label: "Non Veg" }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="veg"
                        value={option.value}
                        checked={vegFilter === option.value}
                        onChange={(e) => setVegFilter(e.target.value)}
                        className="mr-2 text-cyan-500 focus:ring-cyan-500 w-3 h-3"
                      />
                      <span className="text-slate-600 text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-700 mb-2 text-sm">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all duration-300"
                >
                  <option value="name">Name (A to Z)</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  {filteredItems.length} of {menuItems.length} items
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Full Width */}
          <div className="flex-1 min-w-0 pl-0">
            <div className="text-center mb-6">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-3">
                Our <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Menu</span>
              </h2>
              <p className="text-slate-600">
                Discover our delicious selection of homemade meals
              </p>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-slate-400">🍽️</div>
                <p className="text-lg text-slate-500 mb-4">No menu items found matching your filters.</p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const imageUrl = getImageUrl(item.menu_image);
                  return (
                    <div
                      key={item._id}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 overflow-hidden group"
                    >
                      {/* Veg/Non-Veg Badge */}
                      <div
                        className={`absolute top-0 left-0 ${
                          item.menu_type.toLowerCase() === "veg"
                            ? "bg-green-500 text-xs"
                            : "bg-red-600 text-xs"
                        } text-white  font-bold px-3 py-2 rounded-tl-2xl rounded-br-2xl rounded-3md  z-10 shadow-lg`}
                      >
                        {item.menu_type.toUpperCase()}
                      </div>

                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={item.menu_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end">
                          <div className="p-4 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Try our special {item.menu_name} cooked with love!
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-slate-800 mb-3 text-center group-hover:text-cyan-600 transition-colors duration-300 line-clamp-2">
                          {item.menu_name}
                        </h3>

                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xl font-black text-slate-800 whitespace-nowrap">
                            ₹{item.menu_price}
                          </span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm flex-1 min-w-0"
                          >
                            Add to Tiffin
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
};

export default Menu;