function Terms({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* 🔹 Blur + Dark Background */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* 🔹 Terms Box */}
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 z-10 animate-zoomIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center 
                     text-white bg-blue-500 hover:bg-red-500 
                     rounded-full transition-all duration-300 shadow-md"
        >
          ✕
        </button>

        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Terms & Conditions
        </h1>

        <div className="space-y-4 text-gray-700 text-lg leading-relaxed text-justify max-h-[70vh] overflow-y-auto pr-2">
          <p>
            Welcome to <strong className="text-primary">TiffinZone</strong>. By
            using our services, you agree to these terms and conditions.
          </p>
          <p>1. All meals are prepared by verified home chefs following hygiene standards.</p>
          <p>2. Orders once placed cannot be canceled or refunded without valid reason.</p>
          <p>3. TiffinZone is not responsible for allergies or undisclosed ingredients.</p>
          <p>4. Personal information is kept confidential and used only for communication and delivery.</p>
          <p>5. By signing in or placing an order, you accept all terms and notifications.</p>
        </div>
      </div>
    </div>
  );
}

export default Terms;
