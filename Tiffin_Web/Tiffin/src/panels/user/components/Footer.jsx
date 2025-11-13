import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white text-center py-6 mt-8">
      <p>
        &copy; {new Date().getFullYear()} TiffinZone. All rights reserved.
      </p>
      <p className="mt-2 text-sm">
        Designed & Developed by <span className="text-yellow-400">Our Amazing Team</span>
      </p>

      {/* Navigation Links */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <Link to="/menu" className="hover:text-yellow-400">Menu</Link>
        <Link to="/category" className="hover:text-yellow-400">Category</Link>
        <Link to="/about" className="hover:text-yellow-400">About</Link>
      
        <Link to="/terms" className="hover:text-yellow-400">Terms</Link>
        
        
      </div>
    </footer>
  );
}

export default Footer;
