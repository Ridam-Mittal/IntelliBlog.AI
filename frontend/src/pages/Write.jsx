import { useLayoutEffect, useState } from "react";
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import RTE from "../components/RTE";
import toast from "react-hot-toast";

export default function Write() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState(null); // This will now store HTML content
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  console.log(desc);
  const html = desc;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const content = doc.body.textContent || "";
  console.log('content :',content, ' length : ', content.length);



  const publish = async () => {
    if (!title || !desc || !content || content.length < 150) {
      toast.error("Please fill in all required fields with enough content.");
      return;
    }

    toast.success("Publishing blog...");
    setLoading(true);
    try{
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("desc", desc.trim());       
      formData.append("content", content.trim()); 
      if (file) formData.append("photo", file);   

      const { data } = await axios.post('http://localhost:5000/api/post/create-post', formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Blog published successfully!");
      // Optional: Reset state or redirect
      setTitle("");
      setDesc("");
      setFile(null);
    }catch(err){
      console.log(err.response?.data?.error);
      toast.error(err.response?.data?.error || "Publishing failed");
    }finally{
      setLoading(false);
    }
  }


  const refineContent = async () => {
    toast.success("Processing...");
    setLoading(true);
    try{
      const { data } = await axios.post(`http://localhost:5000/api/post/refine-content`, {
        desc: desc.trim(),
        content: content.trim()
      }, {
        withCredentials: true
      })

      setDesc(data.descnew);
      toast.success("Refining successfull");
    }catch(err){
      console.log(err.response?.data?.error);
      toast.error(err.response?.data?.error || "Refinment Failed");
    }finally{
      setLoading(false);
    }
  }


  const generateFromTitle = async () => {
    toast.success("Generating...");
    setLoading(true);
    try{
      const { data } = await axios.post(`http://localhost:5000/api/post/generate-from-title`, {
        title: title.trim()
      }, {
        withCredentials: true
      })
      setIsTyping(true);
      setDesc("");
      const fullText = data.desc;
      console.log(fullText);
      let i = 0;

      const typeCharByChar = () => {
        if (i <= fullText.length) {
          setDesc(fullText.slice(0, i++));
          setTimeout(typeCharByChar, 2); // Typing speed
        } else {
          setIsTyping(false);
        }
      };

      typeCharByChar();
    }catch(err){
      console.log(err);
      toast.error(err.response?.data?.error || "Generation Failed");
      setIsTyping(false);
    }finally{
      setLoading(false);
    }
  }
 
  return (
    <div className="flex-grow bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-8xl px-6 sm:p-5 flex flex-col md:flex-row gap-8">
        
        {/* Left side: image preview and upload */}
        <div className="md:w-2/7 w-full flex flex-col items-center justify-center text-center border-r-2 border-dashed border-blue-400 p-4">
          <label
            htmlFor="fileInput"
            className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-xl p-6 hover:bg-blue-50 transition"
          >
            <i className="fas fa-upload text-4xl text-blue-500 mb-2"></i>
            <span className="text-blue-700 font-semibold">Click to Upload Image</span>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          {file && (
            <img
              className="mt-6 max-h-64 rounded-xl object-cover"
              src={URL.createObjectURL(file)}
              alt="Preview"
            />
          )}
        </div>

        {/* Form container */}
        <div className="md:w-5/7 w-full space-y-4 p-3 flex flex-col items-end bg-white">

          {/* Title input */}
          <input
            type="text"
            placeholder="Title"
            className="w-full bg-gray-100 px-4 py-3 rounded-lg border-2 border-blue-400 focus:ring focus:ring-blue-400 focus:outline-none"
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Generate Blog button */}
          <button
            type="button"
            title="Automatically generate content based on the title"
            disabled={!title.trim() || loading}
            className={`w-auto px-4 py-2 rounded-lg font-semibold transition text-white ${
              (title.length > 5 && content != null && !loading)
                ? "cursor-pointer bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed hover:bg-gray-500"
            } `}
            onClick={generateFromTitle}
          >
            Generate Blog From Title
          </button>
          


          {/* ✅ Replace textarea with rich text editor */}
          <div className="w-full">
            <RTE label="Blog Content" value={desc} onChange={setDesc} isTyping={isTyping} />
          </div>

          <div className="flex w-full justify-between px-3">
            {/* Polish button */}
            <button
              type="button"
              title="Improve your blog's clarity and tone"
              disabled={!desc || loading}
              className={`w-auto py-2 px-4 rounded-lg font-semibold transition text-white ${
                title && content && content?.length > 150 && !loading
                  ? "cursor-pointer bg-green-600 hover:bg-green-700 "
                  : "bg-gray-400 cursor-not-allowed hover:bg-gray-500"
              }`}
            onClick={refineContent}
            >
              Enhance Writing
            </button>

            {/* Publish button */}
            <button
              type="submit"
              title="Submit and publish your blog"
              disabled={!desc || loading}
              className={`w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold ${
                (title && content && content.length > 150 && !loading)
                  ? "cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed hover:bg-gray-500"
              }`}
              onClick={publish}
            >
              Publish Blog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
