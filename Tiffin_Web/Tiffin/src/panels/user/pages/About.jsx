import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <>
      <Navbar />

      {/* 🔹 Added pt-24 to offset navbar */}
      <div className="pt-24">

        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-center text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h1 className="text-5xl sm:text-6xl font-black mb-6">
              About <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Delivering homely meals with love and care since day one
            </p>
          </div>
        </div>

        {/* About Content */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
          <div className="px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-12 border border-slate-200">
              <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
                <p className="text-2xl font-black text-slate-800 mb-8 text-center">
                  Welcome to <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">TiffinZone</span>
                </p>
                
                <p>
                  <strong className="text-slate-800">TiffinZone</strong> is your go-to platform for homemade, healthy, and delicious meals.
                  Our mission is to provide affordable and hygienic food to students, office goers, and anyone who misses the taste of home.
                </p>
                
                <p>
                  We are reviving the love for home food by offering a variety of traditional meals made with love by our local home chefs.
                  These meals are made in hygienic home kitchens using fresh ingredients and authentic recipes passed down through generations.
                </p>
                
                <p>
                  Our chefs are carefully selected and trained to follow hygiene and food safety standards.
                  Every chef is verified and must meet our criteria for quality, cleanliness, and consistency. 
                  We proudly ensure that all our chefs are <span className="font-semibold text-cyan-600">FSSAI registered</span>.
                </p>
                
                <p>
                  We also collect customer feedback regularly to improve taste, quality, and satisfaction.
                  We're passionate about food and committed to making home-cooked meals easily accessible to everyone.
                </p>
                
                <p>
                  From <span className="italic text-cyan-600">spicy Punjabi meals</span> to <span className="italic text-blue-600">simple South Indian dishes</span>, 
                  from <span className="italic text-cyan-600">Gujarati theplas</span> to <span className="italic text-blue-600">Rajasthani dal baati</span> – 
                  we bring India's diversity to your plate. TiffinZone ensures every meal feels like home.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <section className="py-20 px-6 sm:px-10 lg:px-20 bg-white text-center">
          <h2 className="text-4xl font-black text-slate-800 mb-12">
            Meet Our <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">Team</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              { name: "Jatin Jagatiya", role: "Frontend Developer / Backend Developer" },
              { name: "Keyur Patel", role: "Frontend Developer / UI/UX Designer" },
              { name: "Reev Bhandari", role: "Frontend Developer" },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-lg hover:-translate-y-3 transition-all duration-300 border border-slate-200 group"
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{member.name}</h3>
                <p className="text-slate-600">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}

export default About;