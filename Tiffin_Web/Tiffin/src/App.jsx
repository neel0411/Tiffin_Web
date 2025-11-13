import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// ✅ Public Pages
import Home from "./panels/user/pages/Home";
import Menu from "./panels/user/pages/Menu";
import Category from "./panels/user/pages/Category";
import About from "./panels/user/pages/About";
import Feedback from "./panels/user/pages/Feedback";
import Cart from "./panels/user/pages/Cart";
import Payment from "./panels/user/pages/Payment";
import Bill from "./panels/user/pages/bill"; 
import Signup from "./panels/user/pages/Signup";
import Login from "./panels/user/pages/Login";
import Terms from "./panels/user/pages/Terms";
import Profile from "./panels/user/pages/Profile";

// ✅ Supplier Pages
import SDashboard from "./panels/supplier/pages/SDashboard";
import ManageMenu from "./panels/supplier/pages/ManageMenu";
import SFeedback from "./panels/supplier/pages/SFeedback";
import ViewOrders from "./panels/supplier/pages/ViewOrders";

// ✅ Admin Pages
import ADashboard from "./panels/admin/pages/ADashboard";
import ManageCustomers from "./panels/admin/pages/ManageCustomers";
import ViewMenu from "./panels/admin/pages/ViewMenu";
import ManageSuppliers from "./panels/admin/pages/ManageSuppliers";

import ManageOrders from "./panels/admin/pages/ManageOrders";
import ManagePayments from "./panels/admin/pages/ManagePayments";
import AFeedback from "./panels/admin/pages/AFeedback";
import ASidebar from "./panels/admin/components/ASidebar";

// ✅ Private Route Component
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
};

// ✅ Wrapper for Admin Layout (Sidebar + Page)
const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <ASidebar />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</div>
    </div>
  );
};

function App() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  const handleLoginSuccess = (userRole) => {
    localStorage.setItem("role", userRole);
    setRole(userRole);

    if (userRole === "customer") navigate("/");       // ✅ Go to Home
    else if (userRole === "supplier") navigate("/SDashboard");
    else if (userRole === "admin") navigate("/ADashboard");
  };

  return (
    <Routes>
      {/* ---------- Public Routes ---------- */}
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/category" element={<Category />} />
      <Route path="/about" element={<About />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/payment" element={<Payment />} />
      
      {/* ✅ Bill Route - Accessible from Payment page */}
      <Route path="/bill" element={<Bill />} />

      {/* ✅ Terms with close button support */}
      <Route
        path="/terms"
        element={
          <Terms
            onClose={() => {
              navigate(-1);
            }}
          />
        }
      />

      {/* Auth Pages */}
      <Route path="/signup" element={<Signup onSwitch={() => navigate("/login")} />} />
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

      {/* ✅ Profile (for customers) */}
      <Route
        path="/profile"
        element={
          <PrivateRoute allowedRoles={["customer"]}>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* ---------- Supplier Routes ---------- */}
      <Route
        path="/SDashboard"
        element={
          <PrivateRoute allowedRoles={["supplier"]}>
            <SDashboard />
          </PrivateRoute>
        }
      />
      <Route path="/manage-menu" element={<ManageMenu />} />
      <Route path="/Sfeedback" element={<SFeedback />} />
      <Route path="/ViewOrders" element={<ViewOrders />} />

      {/* ---------- Admin Routes (with Sidebar Layout) ---------- */}
      <Route
        path="/ADashboard"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ADashboard />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ManageCustomers"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ManageCustomers />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ManageSuppliers"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ManageSuppliers />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ViewMenu"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ViewMenu />
            </AdminLayout>
          </PrivateRoute>
        }
      />
  
      <Route
        path="/ManageOrders"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ManageOrders />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ManagePayments"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ManagePayments />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/Afeedback"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AFeedback />
            </AdminLayout>
          </PrivateRoute>
        }
      />

      {/* ---------- Catch-All ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;