import { useEffect, useState, useLayoutEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Comment from "./Comment";
import RTE from "./RTE";
import toast from "react-hot-toast";


export default function SinglePost() {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [updateMode, setUpdateMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnloading, setBtnloading] = useState(false)
  const [editedDesc, setEditedDesc] = useState("");
  const [subscribed, setSubscribed] = useState(false); // NEW
  const [subLoading, setSubLoading] = useState(true); // NEW

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const isAuthor = user?.username === post?.author?.username;

  const html = editedDesc;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const editedContent = doc.body.textContent || "";

  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/post/get-post/${path}`);
        setPost(res.data);
        setEditedDesc(res.data.desc); // prefill editor content
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    getPost();
  }, [path]);



  useLayoutEffect(() => {
    if (!post?.author?._id) return; // wait until post is loaded
    checkSubscription();
  }, [post?.author?._id]);

  async function checkSubscription() {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/user/status/${post.author._id}`,
        { withCredentials: true }
      );
      setSubscribed(res.data.subscribed); // axios already gives parsed JSON
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setSubLoading(false);
    }
  }

  

  const handleUpdate = async () => {
    setBtnloading(true);
  try {
    await axios.post(
      `http://localhost:5000/api/post/update-post/${path}`,
      { desc: editedDesc, content: editedContent },
      {
        withCredentials: true,  // send cookies with request
      }
    );
    setPost((prev) => ({ ...prev, desc: editedDesc, content: editedContent }));
    setUpdateMode(false);
    toast.success("Post updated successfully!");
  } catch (error) {
    const message = error.response?.data?.error || "Failed to update post.";
    toast.error(message);
    console.error("Error updating post:", error);
  } finally{
    setBtnloading(false);
  }
};




const handleDeletePost = async () => {
  if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

  try {
    await axios.delete(`http://localhost:5000/api/post/${path}`, {
      withCredentials: true,
    });
    toast.success("Post deleted successfully!");
    navigate('/');
  } catch (error) {
    const message = error.response?.data?.error || "Failed to delete post.";
    toast.error(message);
    console.error("Error deleting post:", error);
  }
};



  const handleSubscribe = async () => {
    if (!user) {
      toast.error("You must be logged in to subscribe.");
      return;
    }
    setSubLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/user/subscribe/${post.author._id}`,
        {},
        { withCredentials: true }
      );
      toast.success("Subscribed successfully!");
      setSubscribed(true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to subscribe.");
    } finally {
      setSubLoading(false);
    }
  }

  const handleUnsubscribe = async () => {
    setSubLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/user/unsubscribe/${post.author._id}`,
        {},
        { withCredentials: true }
      );
      toast.success("Unsubscribed successfully!");
      setSubscribed(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to unsubscribe.");
    } finally {
      setSubLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-grow bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4 py-10 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-grow bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4 py-10 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Post not found.</p>
      </div>
    );
  }

  // Image optimization (optional)
  const transformedURL = post.photo?.url?.replace("/upload/", "/upload/w_600,c_limit,q_auto,f_auto/");

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex-grow rounded-lg shadow-md">

      {transformedURL && (
        <div className="w-full flex justify-center mt-2 mb-8">
          <img
            src={transformedURL}
            alt={post.title}
            className="w-full max-w-[600px] h-auto object-cover rounded-lg shadow-sm"
            loading="lazy"
          />
        </div>
      )}

      <h1 className="text-4xl font-extrabold mb-3 text-gray-900">{post.title}</h1>

      <div className="flex justify-between items-center mb-4 text-gray-600 text-sm">
        <p>
          By <span className="font-semibold text-blue-600">{post.author?.username || "Unknown"}</span>
        </p>
        <p>{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        {!isAuthor && user && (
          <button
            onClick={subscribed ? handleUnsubscribe : handleSubscribe}
            className={`px-4 py-2 rounded text-white cursor-pointer font-semibold ${
              subscribed ? "bg-gray-600 hover:bg-gray-700" : "bg-red-500 hover:bg-red-600"
            }`}
            disabled={subLoading}
          >
            {subLoading
              ? "..."
              : subscribed
              ? "Unsubscribe"
              : "Subscribe"}
          </button>
        )}
      </div>

      {post.summary && (
        <div className="mb-8 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded shadow-sm italic text-indigo-900">
          {post.summary}
        </div>
      )}

      {post.categories?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {post.categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/category/${cat.name}`}
              className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-200 transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {updateMode ? (
        <>
          <RTE label="Blog Content" value={editedDesc} onChange={setEditedDesc} />
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={btnloading}
            >
              {btnloading ? "Saving...": "Save Changes"}
            </button>
            <button
              onClick={() => setUpdateMode(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            className="post-content mb-12"
            dangerouslySetInnerHTML={{ __html: post.desc }}
          ></div>
          {isAuthor && (
            <div className="flex gap-4">
              <button
                onClick={() => setUpdateMode(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Post
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
                    handleDeletePost(); // Your delete handler function
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={btnloading}
              >
                Delete Post
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-10">
        <Comment postId={path} />
      </div>
    </div>
  );
}
