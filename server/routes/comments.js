import { verifyJWT } from '../middlewares/auth.middleware.js';
import { Router } from 'express';
import { Comment } from '../models/Comment.model.js';
import { inngest } from '../inngest/client.js';
import stringSimilarity from 'string-similarity';
import { CommentModeration } from '../models/CommentModeration.js';


const router = Router();


// Create comment route
router.post('/', verifyJWT, async (req, res) => {
  try {
    const { content, postId } = req.body;
    if (!content || !postId) return res.status(400).json({ error: "Content and postId required" });

    const normalizedContent = content.trim().toLowerCase();

    // Check if comment text already flagged as removable
    const flagged = await CommentModeration.findOne({
      commentText: normalizedContent,
      removable: true
    });
    if (flagged) {
      return res.status(403).json({ error: "Your comment contains inappropriate content and cannot be posted." });
    }

    // Fetch recent comments by the user on the same post
    const recentComments = await Comment.find({ 
      post: postId, 
      author: req.user._id 
    }).sort({ createdAt: -1 }).limit(5);

    for (const c of recentComments) {
      const normalizedPrev = c.content.trim().toLowerCase();
      
      if (normalizedPrev === normalizedContent) {
        return res.status(429).json({ error: "Duplicate comment detected" });
      }
      
      const similarity = stringSimilarity.compareTwoStrings(normalizedPrev, normalizedContent);
      if (similarity > 0.8) {
        return res.status(429).json({ error: "Similar comment detected" });
      }
    }

    if (recentComments.length) {
      const lastCommentTime = recentComments[0].createdAt;
      if (Date.now() - new Date(lastCommentTime).getTime() < 15 * 1000) {
        return res.status(429).json({ error: "You are commenting too frequently. Please wait." });
      }
    }

    // Passed spam checks, save comment
    const comment = new Comment({ content, post: postId, author: req.user._id });
    await comment.save();

    const savedComment = await comment.populate('author', 'username');

    console.log("Sending moderation event at", new Date().toISOString(), { commentId: savedComment._id, commentText: savedComment.content });
    // Fire and forget moderation event
    await inngest.send({
      name: "comment/moderate",
      data: {
        commentId: savedComment._id,
        commentText: savedComment.content
      }
    }).catch(err => console.error("Failed to send moderation event", err));

    res.status(201).json(savedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Get comments by post
router.post('/get-comments', async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) return res.status(400).json({ error: "postId required" });

    const comments = await Comment.find({ post: postId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});






// Update comment route
router.post('/:commentId', verifyJWT, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "Content required" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (!comment.author.equals(req.user._id)) return res.status(403).json({ error: "Not authorized" });

    const normalizedContent = content.trim().toLowerCase();

    // Check if comment text already flagged as removable
    const flagged = await CommentModeration.findOne({
      commentText: normalizedContent,
      removable: true
    });
    if (flagged) {
      return res.status(403).json({ error: "Your comment contains inappropriate content and cannot be posted." });
    }

    const recentComments = await Comment.find({ 
      post: comment.post, 
      author: req.user._id, 
      _id: { $ne: commentId }
    }).sort({ createdAt: -1 }).limit(5);


    for (const c of recentComments) {
      const normalizedPrev = c.content.trim().toLowerCase();

      if (normalizedPrev === normalizedContent) {
        return res.status(429).json({ error: "Duplicate comment detected" });
      }

      const similarity = stringSimilarity.compareTwoStrings(normalizedPrev, normalizedContent);
      if (similarity > 0.8) {
        return res.status(429).json({ error: "Similar comment detected" });
      }
    }

    // Optional: rate-limit updates by checking last update time
    if (comment.updatedAt) {
      if (Date.now() - new Date(comment.updatedAt).getTime() < 15 * 1000) {
        return res.status(429).json({ error: "You are updating comments too frequently. Please wait." });
      }
    }

    comment.content = content;
    await comment.save();

    // Populate author before sending response:
    const savedComment = await comment.populate('author', 'username');

    // Send to moderation queue async (fire-and-forget)
    await inngest.send({
      name: "comment/moderate",
      data: {
        commentId: savedComment._id,
        commentText: savedComment.content
      }
    }).catch(err => console.error("Failed to send moderation event", err));

    res.status(200).json({ message: "Comment updated successfully", savedComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});




// Delete comment
router.delete('/:commentId', verifyJWT, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (!comment.author.equals(req.user._id)) return res.status(403).json({ error: "Not authorized" });

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
