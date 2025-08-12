import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";


export default function Navbar({ user }) {
  // console.log(user);
  if(user){
    user = JSON.parse(localStorage.getItem('user'));
  }
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username)}&background=random&color=fff`;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try{
      await axios.get('http://localhost:5000/api/auth/logout', {
        withCredentials: true,
      });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('expiry');
      toast.success("Logged out");
      navigate('/login');
    } catch(err){
      console.error("Verification failed: ", err.response?.data || err.message);
    }
  }

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 ">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Icons */}
        <div className="flex space-x-4 text-gray-800 text-xl">
          <span className="text-2xl font-bold cursor-pointer">IntelliBlog.AI</span>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-16 font-medium">

          <Link to="/" className="hover:text-blue-500">HOME</Link>
          <Link to="/about" className="hover:text-blue-500">ABOUT</Link>
          {user ? (
            <>
            <Link to="/write" className="hover:text-blue-500">WRITE</Link>
            <span onClick={handleLogout} className="cursor-pointer hover:text-red-500">LOGOUT</span>
            <Link to="/settings">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
            </>
          ) : (
            <div className="hidden md:flex space-x-16 font-medium text-gray-800">
              <Link to="/login" className="hover:text-blue-500">LOGIN</Link>
              <Link to="/register" className="hover:text-blue-500">REGISTER</Link>
            </div>
          )}  
          
        </div>
      </div>
    </header>
  );
}
