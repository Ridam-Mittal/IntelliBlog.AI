// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import axios from "axios";

// import Posts from "../components/Posts";
// import Sidebar from "../components/Sidebar";
// import Header from './../components/Header';
// import { useLayoutEffect } from "react";


// export default function PostsPage() {
//   const { search } = useLocation();
//   const location = useLocation();
//   const [posts, setPosts] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState(search || '');

//   const fetchPosts = async () => {
//     try {
//       setIsLoading(true);
//       const { data } = await axios.get("http://localhost:5000/api/post" + search);
//       setPosts(data);
//       console.log(data);
//     } catch (error) {
//       console.error("Error fetching posts:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useLayoutEffect(() => {
//       fetchPosts();
//   }, [location.pathname, search]);

//   return (
//     <>
//       <Header />
//       <main className="py-6">
//         <div className="flex gap-6 justify-between">
//           {/* Left column for posts */}
//           <div className="w-[75%] min-h-screen">
//             {isLoading ? (
//               <div className="flex justify-center items-center h-full">
//                 <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//               </div>
//             ) : (
//               <>
//                 <h1 className="text-4xl font-bold text-gray-800 mt-4 text-center">
//                   {search ? `Results for "${decodeURIComponent(search.replace('?q=', ''))}"` : 'Post Feed'}
//                 </h1>
//                 <Posts posts={posts} />
//               </>
//             )}
//           </div>

//           {/* Right column for sidebar */}
//           <Sidebar posts={posts} />
//         </div>
//       </main>
//     </>
//   );
// }

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import Posts from "../components/Posts";
import Sidebar from "../components/Sidebar";
import Header from './../components/Header';

export default function PostsPage() {
  const { search } = useLocation();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Extract the search query param 'q' from URL, default to empty string
  const queryParams = new URLSearchParams(search);
  const q = queryParams.get("q") || "";

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/post" + search);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [location.pathname, search]);

  const qLower = q.toLowerCase();

  const filteredPosts = posts.filter(post => {
    const inTitle = post.title?.toLowerCase().includes(qLower);
    const inSummary = post.summary?.toLowerCase().includes(qLower);
    const inTags = Array.isArray(post.tags) && post.tags.some(tag => tag.toLowerCase().includes(qLower));
    const inCategories = Array.isArray(post.categories) && post.categories.some(cat => cat.name.toLowerCase().includes(qLower));
    const inAuthor = post.author?.username?.toLowerCase().includes(qLower);

    return inTitle || inSummary || inTags || inCategories || inAuthor;
  });

  return (
    <>
      <Header />
      <main className="py-6">
        <div className="flex gap-6 justify-between">
          {/* Left column for posts */}
          <div className="w-[75%] min-h-screen">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-gray-800 mt-4 text-center">
                  {q ? `Results for "${decodeURIComponent(q)}"` : 'Post Feed'}
                </h1>
                <Posts posts={filteredPosts} />
              </>
            )}
          </div>

          {/* Right column for sidebar */}
          <Sidebar posts={posts} />
        </div>
      </main>
    </>
  );
}
