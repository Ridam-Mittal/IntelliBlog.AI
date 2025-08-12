import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Posts from '../components/Posts';

function CategoryPosts() {
  const { categoryName } = useParams(); // get category name from url
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/post?cat=${encodeURIComponent(categoryName)}`
        );
        setPosts(res.data || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryName]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4 py-12">
      {/* Center content vertically and horizontally */}
      <div className="flex-grow flex flex-col max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-600">
            <h2 className="text-3xl font-semibold mb-4">No posts found in "{categoryName}"</h2>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-center capitalize text-gray-900">
              {categoryName}
            </h1>
            <Posts posts={posts} />
          </>
        )}
      </div>
    </div>
  );
}

export default CategoryPosts;
