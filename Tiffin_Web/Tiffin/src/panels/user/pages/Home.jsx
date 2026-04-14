import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../../../services/api"; // ✅ API import karo

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [testimonials, setTestimonials] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  // ✅ Database se real feedback fetch karo
  React.useEffect(() => {
    const fetchRealTestimonials = async () => {
      try {
        setLoading(true);
        console.log("🔄 Fetching real testimonials from database...");
        
        const response = await api.get("/feedback/latest");
        console.log("📝 Real testimonials:", response.data);
        
        if (response.data && Array.isArray(response.data)) {
          
          setTestimonials(response.data.slice(0, 3));
        } else {
          
          setTestimonials(getFallbackTestimonials());
        }
      } catch (error) {
        console.error("❌ Error fetching testimonials:", error);
        setTestimonials(getFallbackTestimonials());
      } finally {
        setLoading(false);
      }
    };

    fetchRealTestimonials();
  }, []);

  // ✅ Fallback testimonials
  const getFallbackTestimonials = () => {
    return [
      { 
        customer_id: { name: "Priya" }, 
        feedback_text: "The food tastes just like home! Quick delivery too.", 
        rating: 5 
      },
      { 
        customer_id: { name: "Jatin" }, 
        feedback_text: "Affordable and tasty meals. Perfect for students!", 
        rating: 4 
      },
      { 
        customer_id: { name: "Keyur" }, 
        feedback_text: "Love the variety of dishes. Highly recommend!", 
        rating: 5 
      }
    ];
  };

  // ✅ Rating ko stars mein convert karo
  const renderStars = (rating) => {
    if (!rating) return "⭐⭐⭐⭐⭐";
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  // ✅ Customer name get karo
  const getCustomerName = (feedback) => {
    return feedback.customer_id?.name || "Customer";
  };

  // ✅ Feedback text get karo
  const getFeedbackText = (feedback) => {
    return feedback.feedback_text || "Great service and delicious food!";
  };

  // ✅ Rating get karo
  const getRating = (feedback) => {
    return feedback.rating || 5;
  };

  return (
    <>
      {/* Navbar */}
      <Navbar setIsLoginOpen={setIsLoginOpen} />

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 text-center border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Login / Registration</h2>
            <button
              onClick={() => navigate("/login")}
              className="block w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl mb-3 hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              Go to Login
            </button>
            <button
              onClick={() => setIsLoginOpen(false)}
              className="mt-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content Wrapper with padding-top for navbar */}
      <div className="pt-18">

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-slate-50 to-blue-50 px-6 sm:px-10 md:px-20 pt-20 pb-12 text-slate-800">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              Fresh, Healthy & <br /> 
              <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                Homely Food
              </span> 
              <span className="ml-2">🍲</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 leading-relaxed text-slate-600 max-w-2xl">
              Our mission is to ease your day-to-day life with tiffin box services. 
              Just click and order your daily meals online, and get it delivered straight to your doorstep.
            </p>
            <button
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => navigate("/menu")}
            >
              Order Now
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
            <img
              src="img/home.png"
              alt="Delicious Food"
              className="w-4/5 sm:w-3/4 md:w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-3xl"
            />
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 px-6 sm:px-10 lg:px-20 text-center bg-white">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-8">
            About Our Service
          </h2>
          <div className="max-w-4xl mx-auto text-base sm:text-lg leading-relaxed text-slate-600 space-y-4">
            <p>
              We started this platform with a simple vision: to bring fresh, healthy and homely meals 
              right to your doorstep. Our team understands the busy lifestyle of students and professionals, 
              so we created a service that saves your time and gives you wholesome food without compromise.
            </p>
            <p>
              From <span className="font-semibold text-cyan-600">North Indian delicacies</span> to{" "}
              <span className="font-semibold text-blue-600">South Indian flavors</span>, we serve meals
              cooked with love and hygiene, ensuring every bite feels like home.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 sm:px-10 lg:px-20 bg-gradient-to-br from-slate-50 to-blue-50 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-12">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: "🍲", title: "Fresh & Healthy", desc: "Meals cooked with care, just like home." },
              { icon: "💰", title: "Affordable", desc: "Wholesome food at student-friendly prices." },
              { icon: "🚚", title: "Fast Delivery", desc: "Get your meal hot and on time." },
              { icon: "🌍", title: "Variety", desc: "North, South, Veg, Non-Veg – all options available." },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:-translate-y-3 transition-all duration-300 border border-slate-200 hover:shadow-xl group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 sm:px-10 lg:px-20 text-center bg-white">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: "1", title: "Browse Menu", desc: "Explore our tasty meal options." },
              { step: "2", title: "Place Order", desc: "Choose your favorites and order online." },
              { step: "3", title: "Get Delivery", desc: "Meals delivered hot to your doorstep." },
              { step: "4", title: "Enjoy Food", desc: "Relish fresh, homely, and healthy meals." },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-lg hover:scale-105 transition-all duration-300 border border-slate-200 group"
              >
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ REAL Testimonials Section - Database se */}
        <section className="py-20 px-6 sm:px-10 lg:px-20 bg-gradient-to-br from-slate-50 to-blue-50 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-12">
            What Our Customers Say
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              <p className="ml-4 text-slate-600">Loading Feedbacks...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((feedback, index) => (
                <div
                  key={feedback._id || index}
                  className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:-translate-y-3 transition-all duration-300 border border-slate-200"
                >
                  <p className="text-slate-600 italic text-lg mb-6">
                    "{getFeedbackText(feedback)}"
                  </p>
                  <p className="text-yellow-500 text-xl mb-4">
                    {renderStars(getRating(feedback))}
                  </p>
                  <h4 className="font-bold text-slate-800 text-lg">
                    – {getCustomerName(feedback)}
                  </h4>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Call-to-Action Section */}
        <section className="py-20 px-6 sm:px-10 lg:px-20 text-center bg-gradient-to-br from-cyan-500 to-blue-600">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Hungry?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Order now and enjoy fresh, homely meals delivered to you in minutes!
          </p>
          <button
            className="px-10 py-4 bg-white text-cyan-600 rounded-2xl hover:bg-slate-100 transition-all duration-300 font-bold text-lg shadow-2xl hover:scale-105"
            onClick={() => navigate("/menu")}
          >
            Order Now
          </button>
        </section>

        

      </div>

      <Footer />
    </>
  );
};

export default Home;