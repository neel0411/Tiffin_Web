import { NavLink, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar({ transparent = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Logic remains exactly as requested
  const navStyle =
    transparent && !scrolled
      ? "bg-transparent py-6"
      : "bg-slate-900/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out ${navStyle}`}
    >
      <div className="w-full max-w-[2000px] mx-auto px-6 sm:px-10 lg:px-16 flex justify-between items-center">
        {/* 🔹 Logo Section */}
        <div className="flex-shrink-0">
          <NavLink
            to="/"
            className="group flex items-center gap-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter transition-transform active:scale-95"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:rotate-6 transition-transform">
              <span className="text-white text-xl lg:text-2xl">TZ</span>
            </div>
            <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
              TiffinZone
            </span>
          </NavLink>
        </div>

        {/* 🔹 Desktop Navigation (Center) */}
        <div className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
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
                `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm 2xl:text-base transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-blue-500/20 scale-[1.02]"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <span className="filter grayscale group-hover:grayscale-0 transition-all">
                {link.icon}
              </span>
              {link.label}
            </NavLink>
          ))}

          <div className="w-[1px] h-6 bg-white/10 mx-2" />

          {/* Cart Icon (Desktop) */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative flex items-center justify-center w-11 h-11 2xl:w-12 2xl:h-12 rounded-xl transition-all duration-300 border ${
                isActive
                  ? "bg-gradient-to-br from-cyan-400 to-blue-600 border-transparent text-white shadow-lg"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`
            }
          >
            <img
              src="cart.svg"
              className="w-5 h-5 2xl:w-6 2xl:h-6"
              alt="Cart"
            />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 text-[10px] items-center justify-center font-bold text-white">
                0
              </span>
            </span>
          </NavLink>
        </div>

        {/* 🔹 Profile / Auth Section (Right) */}
        <div className="hidden lg:flex items-center gap-4">
          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white
                         bg-gradient-to-r from-cyan-500 to-blue-600
                         hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
                         transition-all duration-300 active:scale-95"
            >
              🔐 Login
            </button>
          ) : (
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-4 py-2 transition-colors">
                <div className="w-9 h-9 2xl:w-10 2xl:h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-black shadow-inner">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden xl:block">
                  <p className="text-sm font-bold text-white leading-tight">
                    {user.name || "User"}
                  </p>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest opacity-80">
                    {user.role}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/profile"
                  title="Profile"
                  className="w-11 h-11 2xl:w-12 2xl:h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all"
                >
                  👤
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="w-11 h-11 2xl:w-12 2xl:h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/5 transition-all"
                >
                  🚪
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🔹 Mobile Controls */}
        <div className="lg:hidden flex items-center gap-3">
          <NavLink
            to="/cart"
            className="p-3 rounded-2xl text-white/80 bg-white/5 border border-white/10 active:scale-90 transition-all"
          >
            <img src="cart.svg" className="w-6 h-6" alt="Cart" />
          </NavLink>

          <button
            onClick={toggleMenu}
            className="p-3 text-2xl rounded-2xl bg-white/10 border border-white/10 text-white active:scale-90 transition-all"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* 🔹 Mobile Menu Overlay */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 ${
          isMenuOpen ? "max-h-[100vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-8 space-y-4">
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
                `flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                    : "text-slate-300 hover:bg-white/5"
                }`
              }
            >
              <span className="text-xl">{link.icon}</span> {link.label}
            </NavLink>
          ))}

          {!user ? (
            <button
              onClick={() => {
                navigate("/login");
                setIsMenuOpen(false);
              }}
              className="w-full mt-6 px-6 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl shadow-xl shadow-cyan-500/20 active:scale-95 transition-transform"
            >
              Login Now
            </button>
          ) : (
            <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{user.name}</p>
                  <p className="text-cyan-400 text-xs font-bold uppercase">
                    {user.role}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-4 bg-white/5 rounded-2xl text-white font-bold border border-white/10"
                >
                  👤 Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 py-4 bg-red-500/10 rounded-2xl text-red-400 font-bold border border-red-500/20"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
