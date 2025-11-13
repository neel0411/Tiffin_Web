import { NavLink, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl z-50 backdrop-blur-sm bg-opacity-95 border-b border-slate-700">
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
         
          <NavLink 
            to="/" 
            className="text-xl sm:text-3xl font-black tracking-tight hover:scale-110 transition-transform"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              TiffinZone
            </span>
          </NavLink>
        </div>

        {/* Center - Navigation Links (Desktop) */}
        <div className="hidden lg:flex gap-1 items-center bg-slate-700/50 backdrop-blur-sm rounded-2xl p-1 border border-slate-600">
          {[
            { to: "/", label: "Home", icon: "🏠" },
            { to: "/menu", label: "Menu", icon: "📋" },
            { to: "/category", label: "My Orders", icon: "📁" },
            { to: "/about", label: "About", icon: "ℹ️" },
            { to: "/feedback", label: "Feedback", icon: "💬" },
          ].map((link, index) => (
            <NavLink
              key={index}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300 font-semibold group ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:text-white hover:bg-slate-600/50"
                }`
              }
            >
              <span className="text-sm group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="text-sm">{link.label}</span>
            </NavLink>
          ))}

          {/* Cart Icon */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300 font-semibold group relative ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-slate-600/50"
              }`
            }
          >
            <span className="text-sm group-hover:scale-110 transition-transform">🛒</span>
          </NavLink>
        </div>

        {/* Right - Login/Profile (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl px-6 py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:from-cyan-600 hover:to-blue-700"
            >
              <span className="text-sm">🔐</span>
              Login / Registration
            </button>
          ) : (
            <div className="flex gap-3 items-center">
              {/* User Info */}
              <div className="flex items-center gap-3 bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-xl px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-white">{user.name || "User"}</p>
                  <p className="text-xs text-slate-300 capitalize">{user.role}</p>
                </div>
              </div>
              
              {/* Profile Button */}
              <Link
                to="/profile"
                className="w-10 h-10 bg-slate-700/50 border border-slate-600 rounded-xl flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:border-cyan-400 hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <span className="text-lg">👤</span>
              </Link>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-10 h-10 bg-slate-700/50 border border-slate-600 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-300 hover:border-red-400 hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <span className="text-lg">🚪</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Cart Icon for Mobile */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `p-3 rounded-xl transition-all border ${
                isActive 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" 
                  : "text-slate-300 hover:bg-slate-700/50 border-slate-600"
              }`
            }
          >
            <span className="text-lg">🛒</span>
          </NavLink>

          <button
            onClick={toggleMenu}
            className="p-3 rounded-xl bg-slate-700/50 backdrop-blur-sm border border-slate-600 hover:bg-slate-600/50 transition-all duration-300"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <span className={`block h-0.5 w-5 bg-slate-300 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`block h-0.5 w-5 bg-slate-300 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-5 bg-slate-300 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl border-t border-slate-700">
          <div className="px-4 py-6 space-y-2">
            {/* Navigation Links */}
            {[
              { to: "/", label: "Home", icon: "🏠" },
              { to: "/menu", label: "Menu", icon: "📋" },
              { to: "/category", label: "My Orders", icon: "📁" },
              { to: "/about", label: "About", icon: "ℹ️" },
              { to: "/feedback", label: "Feedback", icon: "💬" },
            ].map((link, index) => (
              <NavLink
                key={index}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-300 font-semibold border ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg"
                      : "text-slate-300 hover:bg-slate-700/50 border-slate-600"
                  }`
                }
              >
                <span className="text-xl">{link.icon}</span>
                <span className="text-lg">{link.label}</span>
              </NavLink>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-slate-700 space-y-3">
              {!user ? (
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <span className="text-xl">🔐</span>
                  Login / Registration
                </button>
              ) : (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-4 bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-lg">{user.name || "User"}</p>
                      <p className="text-slate-300 text-sm capitalize">{user.role}</p>
                    </div>
                  </div>
                  
                  {/* Profile Button */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-4 bg-slate-700/50 border border-slate-600 text-slate-300 font-semibold rounded-xl px-6 py-4 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-md transition-all duration-300"
                  >
                    <span className="text-xl">👤</span>
                    My Profile
                  </Link>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-4 bg-slate-700/50 border border-slate-600 text-slate-300 font-semibold rounded-xl px-6 py-4 hover:border-red-400 hover:text-red-300 hover:shadow-md transition-all duration-300"
                  >
                    <span className="text-xl">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;