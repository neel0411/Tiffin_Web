import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../../../services/api";
import {
  HiOutlineArrowNarrowRight,
  HiOutlineShieldCheck,
  HiOutlineCurrencyRupee,
  HiOutlineTruck,
  HiOutlineFire,
  HiOutlineStar,
} from "react-icons/hi";

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [testimonials, setTestimonials] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchRealTestimonials = async () => {
      try {
        setLoading(true);
        const response = await api.get("/feedback/latest");
        if (response.data && Array.isArray(response.data)) {
          setTestimonials(response.data.slice(0, 3));
        } else {
          setTestimonials(getFallbackTestimonials());
        }
      } catch (error) {
        setTestimonials(getFallbackTestimonials());
      } finally {
        setLoading(false);
      }
    };
    fetchRealTestimonials();
  }, []);

  const getFallbackTestimonials = () => {
    return [
      {
        customer_id: { name: "Priya" },
        feedback_text: "The food tastes just like home! Quick delivery too.",
        rating: 5,
      },
      {
        customer_id: { name: "Jatin" },
        feedback_text: "Affordable and tasty meals. Perfect for students!",
        rating: 4,
      },
      {
        customer_id: { name: "Keyur" },
        feedback_text: "Love the variety of dishes. Highly recommend!",
        rating: 5,
      },
    ];
  };

  const renderStars = (rating) => {
    const r = rating || 5;
    return (
      <div className="flex gap-1 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <HiOutlineStar
            key={i}
            className={i < r ? "fill-current" : "opacity-30"}
          />
        ))}
      </div>
    );
  };

  const getCustomerName = (feedback) =>
    feedback.customer_id?.name || "Customer";
  const getFeedbackText = (feedback) =>
    feedback.feedback_text || "Great service and delicious food!";
  const getRating = (feedback) => feedback.rating || 5;

  // Animation Variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className="bg-white selection:bg-cyan-100 selection:text-cyan-900 overflow-x-hidden">
      <Navbar transparent={true} setIsLoginOpen={setIsLoginOpen} />

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-slate-100 relative"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
                <HiOutlineShieldCheck className="text-white text-4xl" />
              </div>
              <h2 className="text-3xl font-black mb-3 text-slate-800 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 mb-10 text-base font-medium">
                Log in to track your tiffin or manage your weekly subscriptions.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="group flex items-center justify-center gap-3 w-full px-6 py-5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-2xl mb-5 hover:shadow-2xl hover:shadow-blue-300 transition-all font-bold text-lg"
              >
                Go to Login{" "}
                <HiOutlineArrowNarrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              <button
                onClick={() => setIsLoginOpen(false)}
                className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors tracking-wide"
              >
                MAYBE LATER
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/tiffin.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-slate-950/50 backdrop-brightness-75" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[2000px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-6xl sm:text-7xl lg:text-7xl 2xl:text-8xl font-black text-white leading-[1] tracking-tighter mb-8 mt-8">
                Ghar Jaisa <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-200">
                  Swaad, Daily.
                </span>
              </h1>

              <p className="text-lg md:text-2xl leading-relaxed text-slate-200 max-w-2xl font-medium mb-12 opacity-90">
                Experience the warmth of a mother's kitchen. We deliver fresh,
                nutrient-rich meals that remind you of home, wherever you are.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/menu")}
                  className="px-12 py-6 rounded-2xl font-black text-blue-900 bg-white shadow-2xl shadow-white/10 flex items-center justify-center gap-3 text-lg"
                >
                  Order Now <HiOutlineArrowNarrowRight className="text-2xl" />
                </motion.button>
                <button
                  onClick={() => navigate("/about")}
                  className="px-12 py-6 rounded-2xl border-2 border-white/40 text-white font-bold hover:bg-white/10 backdrop-blur-md transition-all text-lg"
                >
                  Explore Story
                </button>
              </div>

              <div className="mt-20 flex gap-12 md:gap-20 border-t border-white/20 pt-12">
                <div>
                  <p className="text-4xl md:text-5xl font-black text-white">
                    1k+
                  </p>
                  <p className="text-xs md:text-sm font-bold text-cyan-400 uppercase tracking-widest mt-2">
                    Daily Tiffins
                  </p>
                </div>
                <div>
                  <p className="text-4xl md:text-5xl font-black text-white">
                    4.9
                  </p>
                  <p className="text-xs md:text-sm font-bold text-cyan-400 uppercase tracking-widest mt-2">
                    Average Rating
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 md:py-44 px-6 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-10 leading-tight tracking-tight">
              We bring the <br />
              <span className="text-cyan-600 relative inline-block">
                Comfort
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 0 100 5"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                  />
                </svg>
              </span>{" "}
              of Home to you.
            </h2>
            <div className="space-y-8 text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
              <p>
                Started by food enthusiasts who missed home-cooked meals, our
                mission is to ensure no one has to compromise on health for
                convenience.
              </p>
              <div className="flex gap-6 items-start p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-200">
                  <HiOutlineFire className="text-white text-3xl" />
                </div>
                <p className="text-base md:text-lg font-bold text-slate-700 italic leading-snug">
                  "Authentic spices, minimal oil, and seasonal vegetables — just
                  how it's made in your own kitchen."
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 relative">
            <div className="space-y-6 pt-16">
              <div className="h-64 md:h-80 bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl transform -rotate-2">
                <img
                  src="https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80"
                  className="w-full h-full object-cover"
                  alt="Fresh"
                />
              </div>
              <div className="h-44 bg-cyan-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-end shadow-xl">
                <p className="text-4xl font-black">100%</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                  Fresh Ingredients
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-44 bg-blue-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-end shadow-xl">
                <p className="text-4xl font-black">HOT</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                  Insulated Delivery
                </p>
              </div>
              <div className="h-64 md:h-80 bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl transform rotate-2">
                <img
                  src="https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80"
                  className="w-full h-full object-cover"
                  alt="Tiffin"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-44 px-6 lg:px-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              Why Choose Our Tiffin?
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-1 w-12 bg-cyan-500 rounded-full" />
              <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs">
                Quality First
              </p>
              <div className="h-1 w-12 bg-cyan-500 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <HiOutlineFire />,
                title: "Fresh & Healthy",
                color: "bg-orange-500",
                desc: "No frozen junk. Cooked fresh every morning using traditional methods.",
              },
              {
                icon: <HiOutlineCurrencyRupee />,
                title: "Affordable",
                color: "bg-cyan-500",
                desc: "Subscription plans that fit every pocket. No hidden charges.",
              },
              {
                icon: <HiOutlineTruck />,
                title: "Fast Delivery",
                color: "bg-blue-600",
                desc: "GPS tracked delivery partners to ensure your meal is never late.",
              },
              {
                icon: <HiOutlineShieldCheck />,
                title: "Hygienic",
                color: "bg-emerald-500",
                desc: "Kitchens sanitized daily. Regular health checks for our chefs.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -15 }}
                className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white hover:border-cyan-100 transition-all group"
              >
                <div
                  className={`${feature.color} w-20 h-20 rounded-[2rem] flex items-center justify-center text-white text-4xl mb-10 group-hover:rotate-6 transition-transform shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-500 font-medium text-base leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-44 px-6 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
          <div className="lg:w-2/5">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[0.9] tracking-tighter">
              Simple as <br /> <span className="text-blue-600">1-2-3-4</span>
            </h2>
            <p className="text-slate-500 text-xl font-medium leading-relaxed mb-10">
              We've streamlined the process so you can focus on your work while
              we handle the kitchen.
            </p>
            <div className="flex gap-4">
              <div className="w-16 h-1 bg-cyan-500 rounded-full" />
              <div className="w-4 h-1 bg-slate-200 rounded-full" />
              <div className="w-4 h-1 bg-slate-200 rounded-full" />
            </div>
          </div>
          <div className="lg:w-3/5 grid sm:grid-cols-2 gap-8 w-full">
            {[
              {
                step: "01",
                title: "Browse Menu",
                desc: "Daily rotating menus with 20+ meal combinations.",
              },
              {
                step: "02",
                title: "Place Order",
                desc: "One-click checkout for daily or monthly plans.",
              },
              {
                step: "03",
                title: "Get Delivery",
                desc: "Arrives within 30 mins of the scheduled time.",
              },
              {
                step: "04",
                title: "Enjoy Food",
                desc: "Heat, eat, and repeat the goodness every day.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-10 bg-slate-50 rounded-[2.5rem] border-b-8 border-cyan-500 shadow-sm hover:shadow-lg transition-shadow"
              >
                <span className="text-lg font-black text-cyan-600 uppercase tracking-[0.2em]">
                  {item.step}
                </span>
                <h3 className="text-2xl font-bold text-slate-800 mt-4 mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-base font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-40 px-6 lg:px-24 bg-slate-950 text-white rounded-[4rem] mx-4 md:mx-10 mb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">
            Voice of our Customers
          </h2>
          <div className="w-24 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="italic text-slate-400 font-medium">
              Loading the love...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto relative z-10">
            {testimonials.map((feedback, index) => (
              <motion.div
                key={feedback._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/5 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-cyan-400 text-6xl font-serif mb-6 leading-none opacity-50 group-hover:opacity-100 transition-opacity">
                    “
                  </div>
                  <p className="text-xl font-medium text-slate-200 italic mb-10 leading-relaxed">
                    {getFeedbackText(feedback)}
                  </p>
                </div>
                <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
                  {renderStars(getRating(feedback))}
                  <h4 className="font-black text-white uppercase tracking-[0.2em] text-sm">
                    — {getCustomerName(feedback)}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="pb-44 px-6">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 rounded-[4rem] p-12 md:p-32 text-center shadow-3xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

          <motion.div {...fadeInUp}>
            <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter">
              Ready to eat <br className="hidden md:block" /> better?
            </h2>
            <p className="text-white/90 text-xl md:text-2xl mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
              Join 1,000+ happy customers who have reclaimed their health and
              time. Your first tiffin is waiting.
            </p>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-16 py-8 bg-white text-blue-800 rounded-3xl font-black text-2xl shadow-2xl transition-all"
              onClick={() => navigate("/menu")}
            >
              Start Your Tiffin Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
