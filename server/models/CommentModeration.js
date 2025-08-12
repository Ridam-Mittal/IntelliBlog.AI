import mongoose from "mongoose";

const commentModerationSchema = new mongoose.Schema({
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: true,
    },
    commentText: {
        type: String,
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false, // Optional if anonymous
    },
    level: {
        type: String,
        enum: ["none", "mild", "strong", "extreme"],
        required: true,
    },
    explanation: {
        type: String, // e.g., "Detected hate speech in Hindi", or "Contains strong profanity"
        required: false,
    },
    userNotification: {
        type: String,
        required: false,
    },
    removable: {
        type: Boolean,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});


export const CommentModeration = mongoose.model('CommentModeration', commentModerationSchema);