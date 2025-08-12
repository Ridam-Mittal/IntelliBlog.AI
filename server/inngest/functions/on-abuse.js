import { NonRetriableError } from "inngest";
import { inngest } from "../client.js";
import { sendMail } from "../../utils/mailer.js";
import { Comment } from "../../models/Comment.model.js";
import { CommentModeration } from "../../models/CommentModeration.js";
import { moderateComment } from '../../utils/ai.js';


export const onCommentModeration = inngest.createFunction(
  { id: "on-comment-moderation", retries: 2 },
  { event: "comment/moderate" },
  async ({ event, step }) => {
    try {
      console.log("Moderation event received:", event.data);
      const { commentId, commentText } = event.data;

      if (!commentId || !commentText) {
        throw new NonRetriableError("Missing commentId or commentText");
      }

      // 1. Run moderation AI outside step tooling to avoid nesting issues
      let moderationResult;
      try {
        moderationResult = await moderateComment(commentText);
        // console.log("Moderation result:", moderationResult);
      } catch (err) {
        console.error("Error running AI moderation:", err);
        throw err;
      }

      // 2. Get comment and author
      const comment = await step.run("get-comment", async () => {
        const c = await Comment.findById(commentId).populate("author");
        if (!c) throw new NonRetriableError("Comment not found");
        return c;
      });


      // 3. Delete comment if flagged
      // console.log('ModerationResult.removable=>', moderationResult.removable);
      if (moderationResult.removable) {
        try {
          await step.run("delete-comment", async () => {
            console.log(`Deleting comment ${commentId}`);
            await Comment.findByIdAndDelete(commentId);
            // console.log(`Deleted comment ${commentId}`);
          });
        } catch (err) {
          console.error("Error deleting comment:", err);
          throw err;
        }
      }

      // 4. Send warning email if flagged
      if (moderationResult.removable && comment.author && comment.author.email) {
        try {
          await step.run("send-warning-email", async () => {
            console.log(`Sending warning email to ${comment.author.email}`);
            const subject = "⚠️ Your comment has been removed";
            const text = `Hello ${comment.author.username || ''},
              Your comment on our platform was removed due to the following reason:

              ${moderationResult.userNotification}

              Please ensure that your future comments follow our community guidelines.

              Thank you for understanding.
            `;
            const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
              <p>Hello <strong>${comment.author.username || ''}</strong>,</p>
              <p>Your comment was removed due to the following reason:</p>
              <blockquote style="background:#f9f9f9; border-left:4px solid #d9534f; padding:10px; margin:10px 0;">
                ${moderationResult.explanation}
              </blockquote>
              <p>Please make sure your future comments adhere to our community guidelines.</p>
              <p>Thank you for understanding.</p>
            </div>
          `;

            await sendMail(comment.author.email, subject, text, html);
          });
        } catch (err) {
          console.error("Error sending warning email:", err);
          throw err;
        }
      }

      // 5. Save moderation record
      try {
        await step.run("save-moderation-record", async () => {
          await CommentModeration.create({
            commentId,
            commentText: commentText.trim().toLowerCase(),
            user: comment.author?._id || null,
            level: moderationResult.level,
            explanation: moderationResult.explanation,
            userNotification: moderationResult.userNotification,
            removable: moderationResult.removable,
          });
        });
      } catch (err) {
        console.error("Error saving moderation record:", err);
        throw err;
      }

      return {
        success: true,
        removable: moderationResult.removable,
        level: moderationResult.level,
        explanation: moderationResult.explanation,
        userNotification: moderationResult.userNotification,
      };
    } catch (error) {
      console.error("Unhandled error in moderation function:", error);
      throw error; // So Inngest knows to retry or fail
    }
  }
);
