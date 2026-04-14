import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../services/api";

function ManageMenu() {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newItem, setNewItem] = useState({ 
    menu_name: "", 
    menu_price: "", 
    menu_type: "Veg", 
    menu_image: null, 
    preview: "", 
    cat_id: "",
    menu_desc: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const supplierId = localStorage.getItem("userId");

  useEffect(() => {
    fetchCategories();
    fetchMenu();
  }, []);

  // Fetch menu items
  const fetchMenu = async () => {
    try {
      if (!supplierId) return toast.error("⚠️ Supplier not logged in");
      const res = await api.get(`/menu?supplier_id=${supplierId}`);
      console.log("Fetched menu items:", res.data);
      setMenu(res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch menu items");
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
      if (res.data.length > 0) setNewItem(prev => ({ ...prev, cat_id: res.data[0]._id }));
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Failed to load categories.");
    }
  };

  // Handle image file selection
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("❌ Image size should be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("❌ Only image files are allowed");
        return;
      }
      
      setNewItem({ ...newItem, menu_image: file, preview: URL.createObjectURL(file) });
    }
  };

  // Add or update menu item
  const addOrUpdateItem = async () => {
    if (!newItem.menu_name || !newItem.menu_price || !newItem.cat_id) {
      toast.error("⚠️ Please fill all required fields (Name, Price, Category)");
      return;
    }

    if (isNaN(newItem.menu_price) || parseFloat(newItem.menu_price) <= 0) {
      toast.error("⚠️ Please enter a valid price");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("menu_name", newItem.menu_name);
    formData.append("menu_price", newItem.menu_price);
    formData.append("menu_type", newItem.menu_type);
    formData.append("cat_id", newItem.cat_id);
    formData.append("supplier_id", supplierId);
    formData.append("menu_desc", newItem.menu_desc || "");
    
    if (newItem.menu_image) {
      formData.append("menu_image", newItem.menu_image);
    }

    try {
      if (editingId) {
        const response = await api.put(`/menu/${editingId}`, formData);
        console.log("Update response:", response.data);
        toast.success("✅ Menu item updated successfully!");
        setEditingId(null);
      } else {
        const response = await api.post("/menu", formData);
        console.log("Add response:", response.data);
        toast.success("✅ Menu item added successfully!");
      }

      // Reset form
      setNewItem({ 
        menu_name: "", 
        menu_price: "", 
        menu_type: "Veg", 
        menu_image: null, 
        preview: "", 
        cat_id: categories[0]?._id || "",
        menu_desc: ""
      });
      
      // Refresh menu list
      fetchMenu();
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      
      let errorMessage = "Failed to save menu item";
      
      if (err.response) {
        if (err.response.data && err.response.data.errors) {
          const errors = err.response.data.errors;
          errorMessage = Object.values(errors).join(", ");
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        console.error("Server error details:", err.response.data);
      }
      
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit menu item
  const editItem = item => {
    setEditingId(item._id);
    
    // Build correct image URL for preview
    let imagePreview = "";
    if (item.menu_image) {
      imagePreview = getImageUrl(item.menu_image);
    }
    
    setNewItem({
      menu_name: item.menu_name,
      menu_price: item.menu_price.toString(),
      menu_type: item.menu_type,
      menu_image: null,
      preview: imagePreview,
      cat_id: item.cat_id?._id || item.cat_id || "",
      menu_desc: item.menu_desc || ""
    });
  };

  // Delete menu item
  const deleteItem = async id => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      await api.delete(`/menu/${id}`);
      toast.success("🗑️ Menu item deleted successfully");
      fetchMenu();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete menu item");
    }
  };

  // Function to get correct image URL with debugging
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      console.log("No image path provided");
      return "/placeholder.png";
    }

    console.log("Original image path:", imagePath);

    // Already a full URL
    if (imagePath.startsWith('http')) {
      console.log("Already a full URL:", imagePath);
      return imagePath;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://tiffin-web-so1c.onrender.com";

    // Starts with server path
    if (imagePath.startsWith('/uploads/')) {
      const fullUrl = `${baseUrl}${imagePath}`;
      console.log("Built full URL:", fullUrl);
      return fullUrl;
    }

    // Filename only
    if (!imagePath.includes('/')) {
      const fullUrl = `${baseUrl}/uploads/menu/${imagePath}`;
      console.log("Built URL from filename:", fullUrl);
      return fullUrl;
    }

    // If none matched, return placeholder
    console.log("Falling back to placeholder");
    return "/placeholder.png";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 ml-64 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Menu</h1>
            <p className="text-gray-600">Add, edit, or remove items from your menu</p>
          </div>

          {/* Add / Update Form */}
          <div className="mb-8 p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? "Update Menu Item" : "Add New Menu Item"}
              </h2>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setNewItem({ 
                      menu_name: "", 
                      menu_price: "", 
                      menu_type: "Veg", 
                      menu_image: null, 
                      preview: "", 
                      cat_id: categories[0]?._id || "",
                      menu_desc: ""
                    });
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Margherita Pizza" 
                    value={newItem.menu_name} 
                    onChange={e => setNewItem({ ...newItem, menu_name: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={newItem.menu_price} 
                      onChange={e => setNewItem({ ...newItem, menu_price: e.target.value })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select 
                      value={newItem.cat_id} 
                      onChange={e => setNewItem({ ...newItem, cat_id: e.target.value })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.cat_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your menu item..."
                    value={newItem.menu_desc}
                    onChange={e => setNewItem({ ...newItem, menu_desc: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Food Type
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input 
                          type="radio" 
                          name="type" 
                          value="Veg" 
                          checked={newItem.menu_type === "Veg"} 
                          onChange={e => setNewItem({...newItem, menu_type: e.target.value})}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          newItem.menu_type === "Veg" 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-300'
                        }`}>
                          {newItem.menu_type === "Veg" && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <span className="flex items-center gap-2 text-gray-700">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Veg
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input 
                          type="radio" 
                          name="type" 
                          value="Non-Veg" 
                          checked={newItem.menu_type === "Non-Veg"} 
                          onChange={e => setNewItem({...newItem, menu_type: e.target.value})}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          newItem.menu_type === "Non-Veg" 
                            ? 'border-red-500 bg-red-500' 
                            : 'border-gray-300'
                        }`}>
                          {newItem.menu_type === "Non-Veg" && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <span className="flex items-center gap-2 text-gray-700">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Non-Veg
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Item Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {newItem.preview ? (
                        <div className="space-y-3">
                          <img 
                            src={newItem.preview} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover rounded-xl shadow-md mx-auto"
                          />
                          <p className="text-sm text-gray-600">Click to change image</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload an image</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <button 
                  onClick={addOrUpdateItem} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : editingId ? (
                    "Update Menu Item"
                  ) : (
                    "Add to Menu"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Menu List */}
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Menu Items ({menu.length})</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Veg</span>
                <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                <span>Non-Veg</span>
              </div>
            </div>
            
            {menu.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No menu items yet</h3>
                <p className="text-gray-500">Start by adding your first menu item above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menu.map(item => {
                  const imageUrl = getImageUrl(item.menu_image);
                  
                  return (
                    <div key={item._id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white group">
                      <div className="relative">
                        <img 
                          src={imageUrl}
                          alt={item.menu_name} 
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                        <div className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 border-white ${item.menu_type === "Veg" ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => editItem(item)} 
                              className="bg-white/90 backdrop-blur-sm text-blue-600 p-2 rounded-lg hover:bg-white hover:text-blue-700 transition-all shadow-lg"
                              title="Edit item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => deleteItem(item._id)} 
                              className="bg-white/90 backdrop-blur-sm text-red-600 p-2 rounded-lg hover:bg-white hover:text-red-700 transition-all shadow-lg"
                              title="Delete item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg truncate">{item.menu_name}</h3>
                          <span className="text-lg font-bold text-blue-600 ml-2">₹{item.menu_price}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {item.cat_id?.cat_name || "Uncategorized"}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.menu_type === "Veg" 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.menu_type}
                          </span>
                        </div>
                        
                        {item.menu_desc && (
                          <p className="text-sm text-gray-600 line-clamp-2">{item.menu_desc}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </div>
  );
}

export default ManageMenu;