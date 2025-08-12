import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";
import { Post } from "../models/Post.model.js";
import { Category } from "../models/Category.model.js";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { CategoryAssign, generateContent, refineContent, RefineTitle, Summarygenerate, TagAssign } from "../utils/ai.js";
import { inngest } from "../inngest/client.js";


const router = Router();


router.post('/generate-from-title', verifyJWT, async (req, res) => {
    try {
        const { title } = req.body;

        if(!title){
            return res.status(400).json({ error: "Enter a title for Blog" });
        }

        const { desc, content } = await generateContent(title);
        return res.status(200).json({ desc, content })
    }catch (error){
        console.error("error:", error);
        return res.status(500).send(`Internal server error, ${error}`);
    }
})



router.post('/refine-content', verifyJWT, async (req, res) => {
    try{
        const { desc, content } = req.body;

        if(!content || !desc ){
            return res.status(400).json({ error: "Enter content to refine." });
        }

        const { descnew, contentnew } = await refineContent(desc, content);
        return res.status(200).json({ descnew , contentnew })
    }catch(error){
        console.error("error:", error);
        return res.status(500).send(`Internal server error, ${error}`);
    }
})



// CREATE POST
// we can use    ->      new Post() + .save()    /	we can use   ->      Post.create() 
router.post('/create-post', verifyJWT, upload.single('photo'), async(req, res) => {
    try{
        const {title, desc, content,  categories: rawCategories} = req.body;
        
        if(!title){
            return res.status(400).json({ error: "Add a title" });
        }
        if(!desc || !content){
            return res.status(400).json({ error: "Post has no content"});
        }

        // 1️⃣ Refine title
        const refinedTitle = await RefineTitle(content, title);

        // Normalize incoming category names: lowercase + trim
        const normalize = (name) => name.trim().toLowerCase();

        const categoryNames = JSON.parse(rawCategories || "[]").map(normalize);
        const aiCategories = (await CategoryAssign(content, title, categoryNames)).map(normalize);

        const allCategories = [...new Set([...categoryNames, ...aiCategories])];

        // Then query with normalized names
        const existingCats = await Category.find({ name: { $in: allCategories } });
        const existingCatNames = existingCats.map(c => normalize(c.name));

        // Find missing normalized categories
        const missingCats = allCategories.filter(name => !existingCatNames.includes(name));

        // Create missing categories with normalized names
        const createdCats = await Category.insertMany(missingCats.map(name => ({ name })));

        // Continue as before...
        const allCatIds = [...existingCats, ...createdCats].map(c => c._id);


        // 2️⃣ Generate summary
        const { summary } = await Summarygenerate(content, refinedTitle);

        // 3️⃣ Generate tags
        const tags = await TagAssign(content);

        // Create the post and associate the categories
        const userpost = new Post({
            title: refinedTitle,
            desc,
            content,
            author: req.user._id,
            categories: allCatIds,
            summary,
            tags
        });


        const imagepath = req.file?.path;
        let image;
        if(imagepath){
            image = await uploadOnCloudinary(imagepath);

            if (!image?.url || !image?.public_id) {
                return res.status(400).json({ error: "Error while uploading image"});
            }

            userpost.photo = {
                url: image.url,
                public_id: image.public_id
            };
        }

        await userpost.save();

        await inngest.send({ name: "post/created", data: { postId: userpost._id } });

        return res
            .status(200)
            .send(userpost);

    }catch(error){
        console.error("error:", error);
        return res.status(500).send(`Internal server error, ${error}`);
    }
});


/*
Remove duplicate category IDs to avoid mismatch while validating,
as MongoDB's $in returns unique matches even if duplicates are passed.
*/



// UPDATE POST
router.post('/update-post/:id', verifyJWT, async (req, res) => {
  try {
    const { desc, content } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!desc || !content) {
      return res.status(400).json({ error: "Post content is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You are not authorized to edit this post." });
    }

    post.desc = desc;
    post.content = content;

    const updatedPost = await post.save();

    return res.status(200).json({ message: "Post updated successfully", post: updatedPost });

  } catch (error) {
    console.error("error:", error);
    return res.status(500).send("Internal server error");
  }
});




// DELETE POST
router.delete('/post/:id', verifyJWT, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this post" });
    }

    // Delete post's image from Cloudinary if exists
    if (post.photo?.public_id) {
      await deleteFromCloudinary(post.photo.public_id);
    }

    // Delete associated comments
    await Comment.deleteMany({ postId: postId });

    // Delete the post itself
    await post.deleteOne();

    return res.status(200).json({ message: "Post and associated comments deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



/*
🔍 populate() in Mongoose is used to automatically replace references (ObjectIds) with actual data from the related collection.
*/

// GET POST
router.get('/get-post/:id', async (req, res)=>{
    try{
        const postid = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(postid)) {
            return res.status(400).send("Invalid post ID");
        }

        const post = await Post.findById(postid).populate('author').populate('categories', 'name');
        if (!post) {
            return res.status(404).send("Post not found");
        }
        // console.log(post.desc);
        return res.status(200).send(post);
    }catch(error){
        console.error("error:", error);
        return res.status(500).send(`Internal server error, ${error}`);
    }
});



// GET ALL POSTS
router.get("/", async (req, res) => {
  const username = req.query.user;
  const catName = req.query.cat;
  try {
    let posts;

    if (catName) {
      // Find category by name first
      const categoryDoc = await Category.findOne({ name: catName });
      if (!categoryDoc) return res.status(404).send("Category not found");

      const categoryId = categoryDoc._id;

      if (username) {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send("User not found");

        posts = await Post.find({
          author: user._id,
          categories: { $in: [categoryId] }
        }).populate("author").populate("categories", "name");
      } else {
        posts = await Post.find({
          categories: { $in: [categoryId] }
        }).populate("author").populate("categories", "name");
      }
    } else if (username) {
      const user = await User.findOne({ username });
      if (!user) return res.status(404).send("User not found");

      posts = await Post.find({ author: user._id })
        .populate("author")
        .populate("categories", "name");
    } else {
      posts = await Post.find()
        .populate("author")
        .populate("categories", "name");
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).send(`Internal server error, ${error}`);
  }
});
  

export default router;