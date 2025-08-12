import express from 'express';
import dotenv from 'dotenv';
dotenv.config({});
import cors from 'cors';
// import morgan from 'morgan';
import connectDB from './db/db.js';
import cookieParser from 'cookie-parser';
import authRoute from './routes/auth.js';
import userRoute from './routes/users.js';
import postRoute from './routes/posts.js';
import catRoute from './routes/categories.js';
import commentRoute from './routes/comments.js';
import { serve } from 'inngest/express';
import { onCommentModeration } from './inngest/functions/on-abuse.js';
import { onPostAction } from './inngest/functions/on-post-action.js';
import { inngest } from './inngest/client.js';

const app = express();


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true               
}));
const PORT = process.env.PORT || 3000;
// app.use(morgan('dev')); 
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());




app.use('/api/auth', authRoute);


app.use('/api/user', userRoute);

app.use('/api/post', postRoute);

app.use('/api/category', catRoute);

app.use('/api/comment', commentRoute);

app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions: [onCommentModeration, onPostAction] 
    }),
)



connectDB()
.then(()=>{
    app.listen(PORT, () => {
        console.log(`Server is running at port : ${PORT}`);
    })
})
.catch((error)=>{
    console.log('Mongo DB connection failed !', error);
})


