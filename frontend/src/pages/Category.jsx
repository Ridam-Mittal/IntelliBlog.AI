import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Category() {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/category');
        setCategory(data);
      } catch (err) {
        console.log(err.response?.data?.error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4 py-10 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-6 py-12 min-h-screen">
      <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-900 tracking-wide">
        Explore Categories
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-full mx-auto">
        {category.map((cat, idx) => (
          <Link
            key={cat._id || idx}
            to={`/category/${encodeURIComponent(cat.name)}`}
            className="flex items-center justify-center bg-white rounded-lg p-3 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 hover:bg-yellow-300 hover:scale-105 cursor-pointer select-none text-center"
            title={cat.name}
          >
            <h3 className="text-xl font-semibold text-gray-900 tracking-wider">
              {cat.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Category;
