import axios from "axios";

// ✅ Create Axios instance with better configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: false,
});

// ✅ Enhanced Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Clean up URL for logging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log("🚀 API Request:", {
      Method: config.method?.toUpperCase(),
      URL: fullUrl,
      TokenPresent: !!token,
      Timestamp: new Date().toISOString()
    });

    // Attach token if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token attached to request");
    } else {
      console.warn("⚠️ No token found in localStorage");
    }

    // Set default headers
    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // Add timestamp to avoid caching issues
    config.headers["X-Request-Timestamp"] = Date.now();

    return config;
  },
  (error) => {
    console.error("❌ API Request Configuration Error:", {
      Message: error.message,
      Config: error.config
    });
    return Promise.reject(error);
  }
);

// ✅ Enhanced Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response Success:", {
      Status: response.status,
      Method: response.config?.method?.toUpperCase(),
      URL: response.config?.url,
      Data: response.data
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    const errorDetails = {
      URL: `${error.config?.baseURL || ""}${error.config?.url || ""}`,
      Method: error.config?.method?.toUpperCase(),
      Status: error.response?.status,
      StatusText: error.response?.statusText,
      Headers: error.response?.headers,
      Data: error.response?.data,
      Message: error.message,
      Code: error.code
    };

    console.error("❌ API Error Details:", errorDetails);

    // Handle specific error cases
    if (!error.response) {
      error.userMessage = "Cannot connect to server. Please check your internet connection and ensure the server is running.";
    } else if (error.response.status === 401) {
      console.error("🔑 Authentication Error - Token invalid or expired");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      error.userMessage = "Session expired. Please login again.";
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response.status === 403) {
      error.userMessage = "Access denied. You don't have permission to access this resource.";
    } else if (error.response.status === 404) {
      error.userMessage = "Requested resource not found.";
    } else if (error.response.status >= 500) {
      error.userMessage = "Server error. Please try again later.";
    }

    if (!error.userMessage) {
      error.userMessage = "An unexpected error occurred. Please try again.";
    }

    return Promise.reject(error);
  }
);

// ✅ API methods for supplier
export const supplierAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/supplier/dashboard/stats"),
  
  // Profile
  getProfile: () => api.get("/supplier/profile"),
  updateProfile: (data) => api.put("/supplier/profile", data),
  
  // Orders - CORRECTED: Using the orderRoutes path
  getOrders: () => api.get("/orders/supplier"), // This matches your orderRoutes
  updateOrderStatus: (orderId, status) => api.patch(`/orders/${orderId}/status`, { status }),
  
  // Menu
  getMenuItems: () => api.get("/supplier/menu"),
  addMenuItem: (data) => api.post("/supplier/menu", data),
  updateMenuItem: (itemId, data) => api.put(`/supplier/menu/${itemId}`, data),
  deleteMenuItem: (itemId) => api.delete(`/supplier/menu/${itemId}`),
  
  // Feedback
  getFeedback: () => api.get("/feedback"),
  deleteFeedback: (feedbackId) => api.delete(`/feedback/${feedbackId}`), 
};

export const orderAPI = {
  // Customer orders
  getOrders: () => api.get("/orders"),
  createOrder: (data) => api.post("/orders", data),
  addOrderItem: (data) => api.post("/orders/items", data),
  addMultipleOrderItems: (data) => api.post("/orders/items/multiple", data),
  
  // Supplier orders
  getSupplierOrders: () => api.get("/orders/supplier"),
  getSupplierStats: () => api.get("/orders/supplier/stats"),
  getOrderDetails: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  updatePaymentStatus: (orderId, paymentStatus) => api.patch(`/orders/${orderId}/payment`, { payment_status: paymentStatus }),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

export default api;