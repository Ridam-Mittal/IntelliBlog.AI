import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from "../middlewares/multer.middleware.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";
import { Post } from './../models/Post.model.js';
import { Subscription } from "../models/Subscription.model.js";

const router = Router();

router.post('/update', verifyJWT, async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username && !email ) {
            return res.status(400).json({ error: "No data provided to update." });
        }

        const user = await User.findById(req.user?._id).select("-password");

        if (!user) {
            return res.status(404).json({ error : "User not found." });
        }

        if (username === user.username && email === user.email) {
            return res.status(400).json({ error: "No changes detected" });
        }


        await user.updateOne({
            username: username || user.username,
            email: email || user.email
        })

        // Refetch updated user
        const updatedUser = await User.findById(req.user._id).select("-password");

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});



// deletion of account means -> delete account + logout obvious + delete all posts + delete avatar from cloudinary
router.delete('/delete-account', verifyJWT, async(req, res)=>{
    try{
        const user = await User.findById(req.user._id);
        if (!user){ 
            return res.status(404).json({ error : "User not found." }); 
        }

        if(user.role !== 1){
            return res.status(403).json({ error: "Forbidden"});
        }

        const postimages = await Post.find({ author: user._id }).select('photo');

        // delete associated post images of user posts 
        for (const post of postimages) {
            if (post.photo?.public_id) {
                await deleteFromCloudinary(post.photo.public_id);
            }
        }

        await Post.deleteMany({ author: user._id });

        // await user.deleteOne();  -> user is an instance of User model so we can refer to it directly when we have to change just it.
        await User.deleteOne({ _id: user._id });

        res.clearCookie('token');
        return res.status(200).json({ message: "Account deleted successfully." });

    }catch(error){
        console.error("Deletion error:", error);
        return res.status(500).json({ message : `Internal server error`, error: error.message });
    }
})

/*
The reason map() won't work with await in the way you're using it is because map() is designed to run synchronously — it doesn’t wait for promises inside it to resolve.
Here's why:
- map() executes the provided function immediately on each element and does not wait for any asynchronous operations (like await) to finish before moving on to the next iteration.
- await is supposed to pause execution until the promise resolves, but map() does not allow for this kind of "pausing" across iterations.
*/


router.get('/get-user', verifyJWT, async (req, res)=>{
    try {
        const user = await User.findById(req.user?._id).select(" -password");
        return res
        .status(200)
        .json({message: "User fetched successfully", user});
    } catch (error) {
        console.error("error:", error);
        return res.status(500).send(`Internal server error, ${error}`);
    }
});



// Subscribe to author
router.post('/subscribe/:authorId', verifyJWT, async (req, res) => {
  try {
    const subscriber = req.user._id;
    const author = req.params.authorId;

    if (subscriber.equals(author)) {
      return res.status(400).json({ error: "You can't subscribe to yourself" });
    }

    const exists = await Subscription.findOne({ subscriber, author });
    if (exists) {
      return res.status(400).json({ error: "Already subscribed" });
    }

    await Subscription.create({ subscriber, author });
    res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Unsubscribe from author
router.post('/unsubscribe/:authorId', verifyJWT, async (req, res) => {
  try {
    const subscriber = req.user._id;
    const author = req.params.authorId;

    await Subscription.findOneAndDelete({ subscriber, author });
    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


// Check if subscribed
router.get('/status/:authorId', verifyJWT, async (req, res) => {
  try {
    const subscriber = req.user._id;
    const author = req.params.authorId;
    const exists = await Subscription.findOne({ subscriber, author });
    res.json({ subscribed: !!exists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});




export default router;
