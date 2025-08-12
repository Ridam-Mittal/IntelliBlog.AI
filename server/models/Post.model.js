import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true,
    },
    desc:{
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    photo:{
        url: {
            type: String,
            default: ""
        },
        public_id: {
            type: String,
            default: ""
        }
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    categories:[       
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        }
    ],
    tags: {
        type: [String], 
        default: []
    },
    summary: {
        type: String,
        default: ""
    },
},
{timestamps: true});


export const Post = mongoose.model('Post', PostSchema);









/*

author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}
    
The author field stores the ObjectId of the user, not the entire user object.

*/