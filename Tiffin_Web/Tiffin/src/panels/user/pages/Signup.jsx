import { useState } from "react";
import api from "../../../services/api";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    status: "active",
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    address: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Validation function
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Full name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters long";
        } else if (/[0-9]/.test(value)) {
          error = "Name should not contain numbers";
        } else if (!/^[a-zA-Z\s]+$/.test(value.replace(/\s+/g, ''))) {
          error = "Name should only contain letters and spaces";
        }
        break;

      case "phone":
        if (!value.trim()) {
          error = "Mobile number is required";
        } else if (!/^\d{10}$/.test(value.trim())) {
          error = "Please enter a valid 10-digit mobile number";
        }
        break;

      case "address":
        if (!value.trim()) {
          error = "Address is required";
        } else if (value.trim().length < 10) {
          error = "Address must be at least 10 characters long";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters long";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        break;

      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For name field, prevent numbers in real-time
    if (name === "name") {
      // Allow only letters, spaces, and special characters but not numbers
      if (/[0-9]/.test(value)) {
        return; // Don't update if number is entered
      }
    }
    
    setFormData({ ...formData, [name]: value });

    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched({ ...touched, [name]: true });
    
    // Validate the field
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};
    let isValid = true;

    // Validate all fields except role and status
    Object.keys(formData).forEach(key => {
      if (key !== "role" && key !== "status") {
        newTouched[key] = true;
        const error = validateField(key, formData[key]);
        newErrors[key] = error;
        if (error) isValid = false;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("⚠️ Please fix the validation errors before submitting.");
      return;
    }

    try {
      await api.post("/auth/register", formData);
      alert("✅ Account created successfully! Please login.");
      navigate("/login");
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.msg || "Server error"}`);
    }
  };

  // Check if field has error and was touched
  const hasError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    return (
      formData.name &&
      formData.phone &&
      formData.address &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      !Object.values(errors).some(error => error)
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Form Section */}
      <div className="flex flex-1 items-center justify-center p-6 pt-24">
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-200">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl text-white">✨</span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 mb-2">
              Create <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Account</span>
            </h1>
            <p className="text-slate-600">Join TiffinZone today</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-700 ${
                    hasError("name") ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {hasError("name") && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {errors.name}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Mobile Number *"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-700 ${
                    hasError("phone") ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {hasError("phone") && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Email + Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-700 ${
                    hasError("email") ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {hasError("email") && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {errors.email}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="address"
                  placeholder="Address *"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-700 ${
                    hasError("address") ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {hasError("address") && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {errors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Password + Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-700 ${
                    hasError("password") ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {hasError("password") && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {errors.password}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-700 ${
                    hasError("confirmPassword") ? "border-red-400 bg-red-50" : "border-slate-300"
                  }`}
                />
                {hasError("confirmPassword") && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Role Select - No validation */}
            <div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-700 bg-white"
              >
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
              </select>
              <p className="text-slate-500 text-sm mt-2">Choose your role in the platform</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={!isFormValid()}
            >
              Create Account
            </button>

            {/* Login link */}
            <p className="text-center text-slate-600 mt-6">
              Already have an account?{" "}
              <Link to="/login">
                <span className="text-cyan-600 font-bold hover:underline cursor-pointer hover:text-cyan-700 transition-colors">
                  Login
                </span>
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;