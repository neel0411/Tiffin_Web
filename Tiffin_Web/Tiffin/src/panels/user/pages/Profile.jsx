import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("profile"); // profile, password
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Password change states with validation
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordTouched, setPasswordTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(storedUser);
      setFormData({
        name: storedUser.name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        address: storedUser.address || "",
      });
    }
  }, [navigate]);

  // Password validation function
  const validatePasswordField = (name, value) => {
    let error = "";

    switch (name) {
      case "currentPassword":
        if (!value) {
          error = "Current password is required";
        }
        break;

      case "newPassword":
        if (!value) {
          error = "New password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters long";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        break;

      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== passwordData.newPassword) {
          error = "Passwords do not match";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));

    // Validate field if it's been touched
    if (passwordTouched[name]) {
      const error = validatePasswordField(name, value);
      setPasswordErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handlePasswordBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setPasswordTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate the field
    const error = validatePasswordField(name, value);
    setPasswordErrors(prev => ({ ...prev, [name]: error }));
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    const newTouched = {};
    let isValid = true;

    Object.keys(passwordData).forEach(key => {
      newTouched[key] = true;
      const error = validatePasswordField(key, passwordData[key]);
      newErrors[key] = error;
      if (error) isValid = false;
    });

    setPasswordTouched(newTouched);
    setPasswordErrors(newErrors);
    return isValid;
  };

  // Check if password field has error and was touched
  const hasPasswordError = (fieldName) => {
    return passwordTouched[fieldName] && passwordErrors[fieldName];
  };

  // Check if password form is valid
  const isPasswordFormValid = () => {
    return (
      passwordData.currentPassword &&
      passwordData.newPassword &&
      passwordData.confirmPassword &&
      !Object.values(passwordErrors).some(error => error)
    );
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const updatedUser = await res.json();

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setProfileError("Failed to update profile. Please try again.");
      setTimeout(() => setProfileError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!validatePasswordForm()) {
      setProfileError("⚠️ Please fix the validation errors before submitting.");
      setTimeout(() => setProfileError(""), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers/${user._id}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          currentPassword: passwordData.currentPassword, 
          newPassword: passwordData.newPassword 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.message || "Password update failed.");
        setTimeout(() => setProfileError(""), 3000);
        return;
      }

      setSuccessMessage("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordTouched({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      setPasswordErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setProfileError("");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setProfileError("Something went wrong. Please try again.");
      setTimeout(() => setProfileError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      {/* Main Content - Properly aligned below navbar */}
      <main className="flex-grow w-full pt-20 pb-16"> 
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mobile First Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            
            {/* Sidebar Navigation - Hidden on mobile, visible on desktop */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                {/* Profile Summary */}
                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg truncate">{user.name}</h2>
                  <p className="text-gray-600 text-sm truncate">{user.email}</p>
                  <span className="inline-block bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs font-semibold mt-2">
                    {user.status || "Active"} Member
                  </span>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveSection("profile")}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                      activeSection === "profile"
                        ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">👤</span>
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveSection("password")}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${
                      activeSection === "password"
                        ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">🔒</span>
                    Change Password
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Mobile Header */}
                <div className="lg:hidden bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold border border-white/30">
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <h1 className="font-bold text-xl">{user.name}</h1>
                      <p className="text-cyan-100 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  {/* Mobile Navigation */}
                  <div className="flex space-x-1 bg-white/20 backdrop-blur-sm p-1 rounded-xl">
                    {[
                      { id: "profile", label: "Profile", icon: "👤" },
                      { id: "password", label: "Password", icon: "🔒" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                          activeSection === item.id
                            ? "bg-white text-cyan-600"
                            : "text-cyan-100 hover:text-white"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:block bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">
                        {activeSection === "profile" ? "Profile Information" : "Change Password"}
                      </h1>
                      <p className="text-cyan-100">
                        {activeSection === "profile" 
                          ? "Manage your personal information" 
                          : "Update your password securely"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-100">Member Since</div>
                      <div className="font-semibold">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 lg:p-8">
                  
                  {/* Success/Error Messages */}
                  {(profileError || successMessage) && (
                    <div className="mb-6">
                      {profileError && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl font-medium flex items-center gap-2">
                          <span>⚠️</span>
                          {profileError}
                        </div>
                      )}
                      {successMessage && (
                        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl font-medium flex items-center gap-2">
                          <span>✅</span>
                          {successMessage}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile Section */}
                  {activeSection === "profile" && (
                    <div>
                      {!isEditing ? (
                        <div className="space-y-6">
                          {/* Info Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                  <span className="text-cyan-600 text-xl">📧</span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800">Email Address</h3>
                                  <p className="text-gray-600 text-lg font-medium mt-1">{user.email}</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                  <span className="text-cyan-600 text-xl">📞</span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800">Phone Number</h3>
                                  <p className="text-gray-600 text-lg font-medium mt-1">
                                    {user.phone || "Not provided"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="md:col-span-2 bg-gray-50 p-5 rounded-xl border border-gray-200">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <span className="text-cyan-600 text-xl">📍</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-800">Delivery Address</h3>
                                  <p className="text-gray-600 text-lg font-medium mt-1 break-words">
                                    {user.address || "No address provided. Add your address for faster deliveries."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                            <button
                              onClick={() => setIsEditing(true)}
                              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                              <span>✏️</span>
                              Edit Profile
                            </button>
                            <button
                              onClick={() => {
                                localStorage.removeItem("user");
                                localStorage.removeItem("token");
                                navigate("/");
                              }}
                              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                              <span>🚪</span>
                              Logout
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-cyan-600">✏️</span>
                            Edit Your Information
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Full Name *
                                </label>
                                <input
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-gray-700"
                                  placeholder="Enter your full name"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Email Address *
                                </label>
                                <input
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-gray-700"
                                  placeholder="Enter your email"
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-gray-700"
                                  placeholder="Enter your phone number"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Address
                                </label>
                                <textarea
                                  name="address"
                                  value={formData.address}
                                  onChange={handleChange}
                                  rows="3"
                                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-all text-gray-700"
                                  placeholder="Enter your complete address"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                            <button
                              onClick={handleSave}
                              disabled={isLoading}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {isLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <span>✅</span>
                                  Save Changes
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setProfileError("");
                                setSuccessMessage("");
                              }}
                              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                              <span>❌</span>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Password Change Section */}
                  {activeSection === "password" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-cyan-600">🔒</span>
                        Change Your Password
                      </h3>

                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Current Password *
                            </label>
                            <input
                              type="password"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              onBlur={handlePasswordBlur}
                              className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-700 border-2 ${
                                hasPasswordError("currentPassword") ? "border-red-400 bg-red-50" : "border-gray-300"
                              }`}
                              placeholder="Enter your current password"
                            />
                            {hasPasswordError("currentPassword") && (
                              <p className="text-red-500 text-sm mt-2 flex items-center">
                                <span className="mr-1">⚠</span> {passwordErrors.currentPassword}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                New Password *
                              </label>
                              <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                onBlur={handlePasswordBlur}
                                className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-700 border-2 ${
                                  hasPasswordError("newPassword") ? "border-red-400 bg-red-50" : "border-gray-300"
                                }`}
                                placeholder="Enter new password"
                              />
                              {hasPasswordError("newPassword") && (
                                <p className="text-red-500 text-sm mt-2 flex items-center">
                                  <span className="mr-1">⚠</span> {passwordErrors.newPassword}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm Password *
                              </label>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                onBlur={handlePasswordBlur}
                                className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-700 border-2 ${
                                  hasPasswordError("confirmPassword") ? "border-red-400 bg-red-50" : "border-gray-300"
                                }`}
                                placeholder="Confirm new password"
                              />
                              {hasPasswordError("confirmPassword") && (
                                <p className="text-red-500 text-sm mt-2 flex items-center">
                                  <span className="mr-1">⚠</span> {passwordErrors.confirmPassword}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handlePasswordUpdate}
                          disabled={isLoading || !isPasswordFormValid()}
                          className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <span>🔄</span>
                              Update Password
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;