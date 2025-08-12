import React from 'react';

function About() {
  return (
    <div className="flex-grow bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-6 py-12 flex flex-col md:flex-row items-center justify-center gap-40">
      
      {/* Text Content */}
      <div className="md:w-1/2 space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">About This Platform</h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          Welcome to our modern blogging platform — a space where ideas, creativity, and knowledge come together. Whether you're a developer, student, or casual writer, this platform gives you the tools to express yourself effortlessly.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          Built using the MERN stack, it features secure authentication, intuitive blog creation with AI assistance, and a sleek user interface. From generating complete blog posts from just a title to refining your content — everything is designed to save time and spark inspiration.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          Our mission is simple: empower creators by merging smart tools with elegant design. No distractions. Just pure writing joy.
        </p>
      </div>

      {/* Image Section */}
      <div className="md:w-1/3 flex justify-center items-center">
        <img
          src="https://media.istockphoto.com/id/1198931639/photo/writing-a-blog-blogger-influencer-reading-text-on-screen.jpg?s=612x612&w=0&k=20&c=4FJ_fzzZYqBoGG-RY8fcohpaOKKwnnI-ik58cPy6t-g=" // Replace with your own image
          alt="About Illustration"
          className="rounded-2xl shadow-lg w-full object-cover"
        />
      </div>
    </div>
  );
}

export default About;
