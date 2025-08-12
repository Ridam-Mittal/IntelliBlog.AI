import { Link } from "react-router-dom";

export default function Header() {
  return (
    <div className="w-full relative h-[90vh]">
      {/* Background image */}
      <img
        className="w-full h-full object-cover absolute inset-0 z-0"
        src="https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg"
        alt="Header background"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-10"></div>

      {/* Text content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-6 gap-3">
        <h3 className="text-lg md:text-xl tracking-widest uppercase mb-2 font-medium">
          AI-Powered Blogging Platform
        </h3>

        <h1 className="text-5xl md:text-6xl font-bold font-serif mb-4 leading-tight drop-shadow-lg">
          Express Your Voice
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-white mb-8 drop-shadow-md">
          Share insights, tell your story, or dive deep into tutorials — all in one place.
          Built for developers, creators, and curious minds.
        </p>

        <Link className="px-16 py-3 bg-blue-500 font-serif font-bold text-lg tracking-wide rounded-full hover:bg-amber-500 transition-all duration-300 shadow-md cursor-pointer"
        to="/categories">
          EXPLORE
        </Link>
      </div>
    </div>
  );
}
