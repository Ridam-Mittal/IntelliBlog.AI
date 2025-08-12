import { NonRetriableError } from "inngest";
import { inngest } from "../client.js";
import { sendMail } from "../../utils/mailer.js";
import { Post } from "../../models/Post.model.js";
import { Subscription } from "../../models/Subscription.model.js"; // ✅ import Subscription model

export const onPostAction = inngest.createFunction(
  { id: "on-post-action", retries: 2 },
  { event: "post/created" },
  async ({ event, step }) => {
    try {
      console.log("Post created event received:", event.data);
      const { postId } = event.data;

      if (!postId) {
        throw new NonRetriableError("Missing postId in event data");
      }

      // 1. Get the post and author
      const post = await step.run("get-post", async () => {
        const p = await Post.findById(postId).populate("author");
        if (!p) throw new NonRetriableError("Post not found");
        return p;
      });

      if (!post.author || !post.author._id) {
        throw new NonRetriableError("Post author not found");
      }

      // 2. Get subscribers from Subscription collection
      const subscribers = await step.run("get-subscribers", async () => {
        const subs = await Subscription.find({ author: post.author._id })
          .populate("subscriber", "email username");
        return subs.map(s => s.subscriber).filter(Boolean);
      });

      if (!subscribers.length) {
        console.log(`No subscribers for author ${post.author.username}`);
        return { success: true, message: "No subscribers to notify" };
      }

      // 3. Send notification email to each subscriber
      await step.run("send-subscriber-emails", async () => {
        const emailPromises = subscribers.map((subscriber) => {
          const subject = `📰 New post from ${post.author.username}`;
          const text = `Hello ${subscriber.username || ""},

${post.author.username} has published a new post:

Title: ${post.title}

Read it here: ${process.env.CLIENT_URL || "http://localhost:3000"}/post/${post._id}

Best regards,
Your Blog Team`;

          const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
              <p>Hello <strong>${subscriber.username || ""}</strong>,</p>
              <p><strong>${post.author.username}</strong> has published a new post:</p>
              <h2 style="color:#4F46E5;">${post.title}</h2>
              <p>${post.excerpt || ""}</p>
              <p>
                <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/post/${post._id}"
                   style="background:#4F46E5; color:#fff; padding:10px 16px; text-decoration:none; border-radius:5px;">
                  Read Full Post
                </a>
              </p>
              <hr/>
              <p style="font-size: 0.9em; color: #777;">
                You are receiving this email because you subscribed to ${post.author.username}.
              </p>
            </div>
          `;

          return sendMail(subscriber.email, subject, text, html);
        });

        await Promise.all(emailPromises);
        console.log(`Notified ${subscribers.length} subscribers`);
      });

      return {
        success: true,
        notifiedSubscribers: subscribers.length,
      };

    } catch (error) {
      console.error("Unhandled error in on-post-action function:", error);
      throw error;
    }
  }
);
