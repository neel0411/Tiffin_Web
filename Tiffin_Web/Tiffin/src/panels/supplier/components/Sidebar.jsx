import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUtensils, FaComments, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (role !== "supplier") return null;

  return (
    <div className="w-64 bg-white shadow-xl rounded-r-2xl p-6 min-h-screen fixed top-0 left-0 flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-green-600 mb-6">Supplier</h2>

        {/* User Card */}
        <div className="flex items-center gap-4 bg-green-50 p-3 rounded-xl shadow-inner mb-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            {user?.name && (
              <>
                <p className="text-gray-700 font-semibold text-lg leading-tight">{user.name}</p>
                <p className="text-green-600 text-sm font-medium">Welcome back!</p>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-5 ">
          <NavLink
            to="/SDashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-green-100 hover:text-green-700 ${
                isActive ? "bg-green-200 text-green-700 font-semibold" : "text-gray-700"
              }`
            }
          >
            <FaTachometerAlt /> Dashboard
          </NavLink>
          <NavLink
            to="/manage-menu"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-green-100 hover:text-green-700 ${
                isActive ? "bg-green-200 text-green-700 font-semibold" : "text-gray-700"
              }`
            }
          >
            <FaUtensils /> Manage Menu
          </NavLink>
          <NavLink
            to="/Sfeedback"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-green-100 hover:text-green-700 ${
                isActive ? "bg-green-200 text-green-700 font-semibold" : "text-gray-700"
              }`
            }
          >
            <FaComments /> Feedback
          </NavLink>
          <NavLink
            to="/ViewOrders"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-green-100 hover:text-green-700 ${
                isActive ? "bg-green-200 text-green-700 font-semibold" : "text-gray-700"
              }`
            }
          >
            <FaShoppingCart /> View Orders
          </NavLink>
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 mt-6 px-4 py-2 rounded-lg text-red-600 font-semibold hover:bg-red-100 transition-all"
      >
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
}

export default Sidebar;
