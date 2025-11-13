import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast, Toaster } from "react-hot-toast";
import api from "../../../services/api";

function Feedback() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCustomerId(user.id || user._id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    setSupplierId("65d8f1a5c8b6c94f4c123457");
  }, []);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating!");
      return;
    }

    if (!message.trim()) {
      toast.error("Please write your feedback!");
      return;
    }

    const feedbackData = {
      customer_id: customerId,
      supplier_id: supplierId,
      rating: rating,
      feedback_text: message.trim(),
    };

    try {
      setLoading(true);
      await api.post("/feedback", feedbackData);
      toast.success("Thank you for your feedback!");
      setRating(0);
      setMessage("");
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to submit feedback. Please Login First.");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, hoverRating, onHoverChange }) => {
    return (
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-4xl transition-transform duration-200 hover:scale-110 ${
              star <= (hoverRating || rating)
                ? "text-yellow-400"
                : "text-slate-300"
            }`}
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => onHoverChange(star)}
            onMouseLeave={() => onHoverChange(0)}
            disabled={loading}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = (rating) => {
    const ratings = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    return ratings[rating] || "Select Rating";
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-slate-800 mb-4">
              Share Your <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Experience</span>
            </h1>
            <p className="text-xl text-slate-600">Your feedback helps us improve our service</p>
          </div>

          {/* Feedback Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-8 space-y-8">
              {/* Rating Section */}
              <div className="text-center">
                <label className="block text-lg font-semibold text-slate-700 mb-6">
                  How would you rate your experience?
                </label>
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  hoverRating={hoverRating}
                  onHoverChange={setHoverRating}
                />
                <p className="mt-4 text-xl font-semibold text-slate-800">
                  {getRatingText(hoverRating || rating)}
                </p>
              </div>

              {/* Feedback Text */}
              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-4">
                  Share your thoughts
                </label>
                <textarea
                  placeholder="What did you like? What can we improve?..."
                  className="w-full px-6 py-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-all text-slate-700"
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || !rating}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Genuine Reviews</h3>
              <p className="text-slate-600">Real feedback from real customers</p>
            </div>
            
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Helps Improve</h3>
              <p className="text-slate-600">Your feedback makes us better</p>
            </div>
            
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Instant Notification</h3>
              <p className="text-slate-600">Suppliers get immediate updates</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
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
}

export default Feedback;