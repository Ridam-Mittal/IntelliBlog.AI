import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email.trim(),
          password: password.trim(),
        },
        {
          withCredentials: true,
        }
      );

      toast.success(data.message);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem('expiry', Date.now() + 86400000); // 24 hrs in ms
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
      <div className="flex bg-white rounded-2xl shadow-lg max-w-4xl w-full">
        {/* Left Image Side */}
        <div className="w-1/2">
          <img
            src='https://images.pexels.com/photos/19124701/pexels-photo-19124701/free-photo-of-green-forest-in-valley-in-mountains.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            alt="Login Illustration"
            className="rounded-2xl h-full object-cover"
          />
        </div>

        {/* Right Form Side */}
        <div className="w-1/2 px-8 py-6 flex flex-col justify-center items-center">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Login</h2>
          <form onSubmit={handleSubmit} className=" w-4/5 space-y-8 flex flex-col">
            <label className="block mb-1 text-md font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email..."
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="block mb-1 text-md font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password..."
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>
          <p className="text-center mt-4 text-lg text-gray-800">
              Don't have an account?{" "}
              <Link to="/register" className="text-purple-600 hover:underline">
                Register
              </Link>
            </p>
            <p className="mt-4 text-center text-lg text-gray-800">
              Go to Home?{" "}
              <Link to="/" className="text-purple-600 hover:underline">
                Home
              </Link>
            </p>
        </div>
      </div>
    </div>
  );
}

export default Login;



  