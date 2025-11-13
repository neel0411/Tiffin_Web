// login.jsx - COMPLETE FIXED VERSION
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Navbar from "../components/Navbar";
import Terms from "./Terms";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("🔐 Login attempt:", { email });

    // ✅ FIX: Prevent automatic redirect
    e.preventDefault();
    e.stopPropagation();

    // ---------- HARD-CODED ADMIN ----------
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";

    if (email === adminEmail && password === adminPassword) {
      console.log("✅ Admin login successful");
      
      // ✅ FIX: Use simple token format
      localStorage.setItem("token", "admin-token");
      localStorage.setItem("user", JSON.stringify({ 
        name: "Admin", 
        email, 
        role: "admin", 
        status: "active",
        _id: "admin-id"
      }));
      localStorage.setItem("role", "admin");
      localStorage.setItem("userId", "admin-id");
      
      setLoading(false);
      navigate("/ADashboard");
      return;
    }

    // ---------- CUSTOMER / SUPPLIER LOGIN ----------
    try {
      console.log("🔄 Attempting API login...");
      const { data } = await api.post("/auth/login", { email, password });

      if (data.user.status === "blocked") {
        alert("⚠️ Your account is blocked. Please contact support.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("userId", data.user._id);

      console.log("✅ Login successful, redirecting...");

      if (data.user.role === "customer") navigate("/");
      else if (data.user.role === "supplier") navigate("/SDashboard");
      else navigate("/");
    } catch (err) {
      console.error("❌ Login error:", err);
      alert(`❌ Error: ${err.response?.data?.message || err.response?.data?.msg || "Login failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6 relative">
      <Navbar />
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-200 relative z-10 mt-20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl text-white">🔐</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">
            Welcome <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Back</span>
          </h1>
          <p className="text-slate-600">Sign in to your account</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-700"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-700"
              required
            />
          </div>
          
          <p className="text-sm text-slate-600 text-center">
            By signing in, you accept our{" "}
            <span
              onClick={() => setShowTerms(true)}
              className="text-cyan-600 font-semibold hover:underline cursor-pointer hover:text-cyan-700 transition-colors"
            >
              Terms & Conditions
            </span>
          </p>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
          
          <p className="text-center text-slate-600 mt-6">
            Don't have an account?{" "}
            <Link to="/signup">
              <span className="text-cyan-600 font-bold hover:underline cursor-pointer hover:text-cyan-700 transition-colors">
                Sign Up
              </span>
            </Link>
          </p>
        </form>
      </div>

      {/* ✅ Show Terms Modal */}
      {showTerms && <Terms onClose={() => setShowTerms(false)} />}
    </div>
  );
}

export default Login;