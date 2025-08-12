// import Post from "./Post";

// export default function Posts({ posts }) {
//   return (
//     <div className="grid gap-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-8">
//       {posts?.map((post) => (
//         <Post post={post} key={post._id} />
//       ))}
//     </div>
//   );
// }

import Post from "./Post";

export default function Posts({ posts }) {
  return (
    <section className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
      {
        posts?.length === 0 ? (
          <p className=" border-gray-600 rounded-lg text-center text-lg py-5 bg-gray-200 shadow-md">
            No Posts Found..
          </p> 
        ): (
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 border border-gray-300 p-5 rounded-lg shadow-md bg-gray-200">
        {posts?.map((post) => (
          <Post post={post} key={post._id} />
        ))}
      </div>
      )}
    </section>
  );
}
