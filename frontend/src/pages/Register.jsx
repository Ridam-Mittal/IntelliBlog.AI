import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`http://localhost:5000/api/auth/register`, {
        username,
        email,
        password,
      }, { withCredentials: true });

      toast.success("Registered successfully!");

      localStorage.setItem("token", data.token); 
      localStorage.setItem("user", JSON.stringify(data.user));
      const expiryTime = Date.now() + 86400000; // 1 day from now
      localStorage.setItem("expiry", expiryTime);
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
      <div className="flex bg-white rounded-2xl shadow-lg max-w-4xl w-full">
        {/* Left Image Section */}
        <div className="w-1/2">
          <img
            src="https://hips.hearstapps.com/hmg-prod/images/alpe-di-siusi-sunrise-with-sassolungo-or-langkofel-royalty-free-image-1623254127.jpg?crop=1xw:1xh;center,top&resize=980:*"
            alt="Register"
            className="rounded-2xl h-full object-cover"
          />
        </div>

        {/* Right Form Section */}
        <div className="w-1/2 px-8 py-6 flex flex-col justify-center items-center">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800 text-center">Create Account</h2>
          <form onSubmit={handleSubmit} className="w-4/5 space-y-8 flex flex-col">
            <div>
              <label className="block mb-1 text-md font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Enter your username"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-md font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-md font-medium text-gray-800">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 font-semibold"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-center text-lg text-gray-800">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
          <p className="mt-4 text-center text-lg text-gray-800">
            Go to Home?{" "}
            <Link to="/" className="text-blue-500 hover:underline">
              Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
