import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Comment({ postId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [btnloading, setBtnloading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Get logged-in user info from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          `http://localhost:5000/api/comment/get-comments`,
          { postId },
          { withCredentials: true }
        );
        // console.log(res.data.comments);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error(err.response?.data?.error);
        toast.error(err.response?.data?.error || 'Error fetching comments');
      } finally {
        setLoading(false);
      }
    };
    if (postId) fetchComments();
  }, [postId]);


  // Handle posting new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBtnloading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comment/`,
        { content, postId },
        { withCredentials: true }
      );
      toast.success("Comment added");
      setComments([res.data, ...comments]);
      setContent('');
    } catch (err) {
      console.error('Error posting comment:', err.response?.data?.error);
      toast.error(err.response?.data?.error || "Failed to post comment");
    } finally {
      setBtnloading(false);
    }
  };

  // Start editing a comment
  const startEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };

  // Cancel editing mode
  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };


  // Save edited comment
  const saveEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Comment content cannot be empty");
      return;
    }
    setBtnloading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comment/${editingCommentId}`,
        { content: editContent },
        { withCredentials: true }
      );
      toast.success("Comment updated");
      setComments(comments.map(c => c._id === editingCommentId ? res.data.comment : c));
      cancelEdit();
    } catch (err) {
      console.error('Error updating comment:', err.response?.data?.error);
      toast.error(err.response?.data?.error || 'Failed to update comment');
    } finally {
      setBtnloading(false);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    setBtnloading(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/comment/${commentId}`,
        { withCredentials: true }
      );
      toast.success("Comment deleted");
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err.response?.data?.error);
      toast.error(err.response?.data?.error || 'Failed to delete comment');
    } finally {
      setBtnloading(false);
    }
  };

  
  return (
  <div className="mt-20 max-w-4xl mx-auto">
    <h2 className="text-2xl font-semibold mb-6">Comments</h2>

    {/* New Comment Input */}
    {user ? (
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={btnloading}
        />
        <button
          type="submit"
          className={`px-6 py-3 rounded-md text-white ${
            btnloading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition`}
          disabled={btnloading}
        >
          {btnloading ? "Posting..." : "Post"}
        </button>
      </form>
    ) : (
      <p className="mb-6 text-gray-600 italic">Login to write comments.</p>
    )}

    {/* Comments List */}
    <div className="space-y-5 max-h-[350px] overflow-y-auto border-t pt-6 px-3">
      {loading ? (
        <p className="text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">No comments yet.</p>
      ) : (
        comments.map((comment) => {
          const isCommentAuthor = user?._id === comment.author?._id;

          return (
            <div
              key={comment._id}
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-center mb-3 overflow-y-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg select-none">
                    {comment.author?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="font-semibold text-gray-900">{comment.author?.username || 'Unknown'}</span>
                </div>
                <span className="text-md text-gray-400 font-mono">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>

              {editingCommentId === comment._id ? (
                <>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-3 mb-3 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={btnloading}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={saveEdit}
                      disabled={btnloading}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      {btnloading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={btnloading}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed break-words">{comment.content}</p>
                  {isCommentAuthor && (
                    <div className="mt-4 flex gap-6">
                      <button
                        onClick={() => startEdit(comment)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition cursor-pointer"
                        disabled={btnloading}
                      >
                        Edit
                      </button>|
                      <button
                        onClick={() => deleteComment(comment._id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800 transition cursor-pointer"
                        disabled={btnloading}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  </div>
);

}

export default Comment;
