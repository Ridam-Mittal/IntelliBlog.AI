import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Posts from "../components/Posts";
import { useLocation } from "react-router-dom";

export default function Settings() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [posts, setPosts] = useState([]);

  const handleUpdate = async () => {
    if (!username.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/user/update",
        { username: username.trim(), email: email.trim() },
        { withCredentials: true }
      );

      toast.success("Profile updated successfully!");
      const updatedUser = { ...user, username: data.user.username, email: data.user.email };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error(err.response?.data?.error);
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    if (!username) return;
    setIsLoadingPosts(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/post?user=${encodeURIComponent(username)}`);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [username]);

  return (
    <>
      <div className="absolute top-0 z-50 w-full">
        <Navbar user={user} />
      </div>

      <main className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 min-h-screen p-5">
        <div className="w-full flex justify-evenly">
          
          {/* Profile Settings */}
          <div className="w-[25%] pt-20">
            <div className="bg-white shadow-lg rounded-xl p-6 space-y-9 border border-gray-300">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Account Settings</h2>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition duration-200"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
          </div>

          {/* User's Posts */}
          <div className="lg:col-span-2 rounded-xl w-[80%]">
            <h2 className="text-3xl font-semibold text-gray-800 w-full text-center mb-[-30px]">
              Your Posts
            </h2>
            {isLoadingPosts ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : posts.length > 0 ? (
              <Posts posts={posts} />
            ) : (
              <p className="text-gray-500 text-center">No posts yet.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
