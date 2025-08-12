// import { Link } from "react-router-dom";

// export default function Post({ post }) {
//   return (
//     <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-[450px] border border-gray-200 hover:border-gray-300">
//       {/* Link around image */}
//       {post.photo && (
//         <Link to={`/post/${post._id}`}>
//           <img
//             src={post.photo.url}
//             alt={post.title}
//             className="w-full h-48 object-cover"
//           />
//         </Link>
//       )}

//       {/* Content */}
//       <div className="p-4 flex flex-col flex-grow bg-gray-50">
//         {/* Title as link */}
//         <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
//           <Link to={`/post/${post._id}`} className="hover:underline">
//             {post.title}
//           </Link>
//         </h2>

//         {/* Meta */}
//         <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-1">
//           <span>{post.author?.username}</span>
//           <span> · </span>
//           <span>{new Date(post.createdAt).toDateString()}</span>
//         </div>

//         {/* Categories */}
//         <div className="flex gap-2 mt-2 flex-wrap">
//           {post.categories.map((c, i) => (
//             <Link
//               key={i}
//               to={`/category/${c.name || c}`} // ensure correct ID
//               className="bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-sm hover:bg-blue-200"
//             >
//               {c.name || c}
//             </Link>
//           ))}
//         </div>

//         {/* Divider */}
//         <hr className="text-gray-300 mt-3 mb-3" />

//         {/* Description */}
//         <p className="text-sm text-gray-800 line-clamp-4">
//           {post.summary}
//         </p>
//       </div>
//     </div>
//   );
// }

import { Link } from "react-router-dom";

export default function Post({ post }) {
  // Extract plain text snippet from post.desc (remove HTML tags)
  const snippet = post.desc
    ? post.desc.replace(/<[^>]+>/g, "").slice(0, 140) + "..."
    : "";

    console.log(post.tags);

  return (
    <article className="bg-white rounded-lg  hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-[420px] border border-gray-200 hover:border-gray-300 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
      <Link to={`/post/${post._id}`} className="block h-48 overflow-hidden rounded-t-lg">
        {post.photo ? (
          <img
            src={post.photo.url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 rounded-t-lg">
            No Image
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-grow bg-gray-50 rounded-b-lg">
        <Link
          to={`/post/${post._id}`}
          className="text-xl font-bold text-gray-900 line-clamp-2 hover:underline"
        >
          {post.title}
        </Link>

        <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
          <span>
            By <span className="font-semibold">{post.author?.username || "Unknown"}</span>
          </span>
          <span className="select-none">·</span>
          <time
            dateTime={post.createdAt}
            title={new Date(post.createdAt).toLocaleString()}
          >
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {post.categories?.map((cat, idx) => (
            <Link
              key={idx}
              to={`/category/${cat.name || cat}`}
              className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200"
            >
              {cat.name || cat}
            </Link>
          )).slice(0,2)}
        </div>

        <hr className="my-4 border-gray-300" />

        <p className="text-gray-700 text-sm flex-grow line-clamp-4">{post.summary}</p>
      </div>
    </article>
  );
}
