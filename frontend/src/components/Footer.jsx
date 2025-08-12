import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookSquare,
  faTwitterSquare,
  faPinterestSquare,
  faInstagramSquare
} from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-white shadow-lg">
      <div className="max-w-8xl mx-auto px-10 py-6 flex flex-col md:flex-row justify-between items-center text-gray-800 text-sm">
        
        {/* Left: Text */}
        <div className="mb-4 md:mb-0 text-center md:text-left text-md">
          <p>&copy; {new Date().getFullYear()} YourBlog. All rights reserved.</p>
        </div>

        {/* Center: Links */}
        <div className="flex space-x-20 text-base font-medium">
          <Link to="/" className="hover:text-blue-500 cursor-pointer">Home</Link>
          <Link to="/about" className="hover:text-blue-500 cursor-pointer">About</Link>
          <p className="hover:text-blue-500 cursor-pointer">Reach me at: contact@intelliblog.ai</p>
        </div>

        {/* Right: Social Icons */}
        <div className="flex space-x-4 text-xl mt-4 md:mt-0">
          <FontAwesomeIcon icon={faFacebookSquare} className="hover:text-blue-600 cursor-pointer" style={{fontSize: '30px'}}/>
          <FontAwesomeIcon icon={faTwitterSquare} className="hover:text-blue-400 cursor-pointer" style={{fontSize: '30px'}}/>
          <FontAwesomeIcon icon={faPinterestSquare} className="hover:text-red-500 cursor-pointer" style={{fontSize: '30px'}}/>
          <FontAwesomeIcon icon={faInstagramSquare} className="hover:text-pink-500 cursor-pointer" style={{fontSize: '30px'}}/>
        </div>
      </div>
    </footer>
  );
}
