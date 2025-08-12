import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ posts }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse `q` param from URL on mount and when URL changes
  const params = new URLSearchParams(location.search);
  const queryFromUrl = params.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(queryFromUrl);

  // Sync local input with URL q param changes (e.g. back/forward navigation)
  useEffect(() => {
    setSearchQuery(queryFromUrl);
  }, [queryFromUrl]);

  // Count categories
  const categoryCount = {};
  posts?.forEach((post) => {
    if (Array.isArray(post.categories)) {
      post.categories.forEach((cat) => {
        categoryCount[cat.name] = (categoryCount[cat.name] || 0) + 1;
      });
    }
  });

  const popularCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Get 3 most recent posts
  const recentPosts = [...(posts || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Clear query when input empty to show all posts
      navigate(`/`);
    }
  };

  // When user types in input
  const onInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() === "") {
      // Clear URL query param if input is cleared
      navigate(`/`);
    }
  };

  return (
    <aside className="w-[25%] bg-white p-4 rounded-lg shadow sticky right-0 min-h-screen self-start flex flex-col">
      {/* Search Bar */}
      <div className="mb-6 mt-4">
        <div className="flex items-center gap-2">
          <input
            id="search"
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={onInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full border-indigo-400 border-2 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600 focus:border-2"
            autoComplete="off"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Search
          </button>
        </div>
      </div>

      {/* Site Info */}
      <div className="mb-6 flex flex-col justify-center items-center p-3">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">About This Platform</h2>
        <div className="flex items-start gap-3 flex-col">
          <img
            src="https://i.ibb.co/SXhystt4/adventure-trip-travel-destination-hiking-nature-concept.jpg"
            alt="Blog logo"
            className="object-contain rounded-md"
          />
          <p className="text-md text-gray-800 text-center">
            A place where tech meets thoughts. Explore articles on software, coding tips, and personal learning journeys.
          </p>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="mb-6 flex flex-col justify-center items-center p-3 flex-wrap">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Popular Categories</h2>
        <ul className="flex flex-wrap gap-4 mb-6 items-center justify-center">
          {popularCategories.map(([category, count]) => (
            <Link
              key={category}
              to={`/category/${category}`}
              className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-200 transition"
            >
              {category} ({count})
            </Link>
          ))}
        </ul>
      </div>

      {/* Recent Posts */}
      <div className="mb-10 flex flex-col justify-center items-center p-3">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Posts</h2>
        <ul className="flex gap-2 flex-col items-center">
          {recentPosts.map((post) => (
            <Link
              key={post._id}
              to={`/post/${post._id}`}
              className="text-md text-blue-500 truncate hover:text-blue-800 cursor-pointer font-medium overflow-hidden whitespace-nowrap max-w-[250px]"
            >
              {post.title}
            </Link>
          ))}
        </ul>
      </div>
    </aside>
  );
}
