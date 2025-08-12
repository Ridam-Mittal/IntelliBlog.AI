import { Router } from "express";
import { User } from './../models/User.model.js';
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from '../utils/Cloudinary.js';
import { comparePassword, hashPassword } from "../helper/helper.js";
import jwt from 'jsonwebtoken';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/register',  async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({error: "Account with this Email or Username already exists"});
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        const createdUser = await User.findById(user._id).select("-password");

        if (!createdUser) {
            return res.status(500).json({error: "Something went wrong while registering the user."});
        }

        const token = jwt.sign(
            {_id: user._id,  role: user.role },
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );
        
        const options = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        };

        res.cookie("token", token, options);

        return res.status(200).json({message: "Account created.", user: createdUser, token});

    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});





router.post('/login', async (req, res) => {

    try{

        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({error: "Email or Password is not entered"});
        }

        const user = await User.findOne({ email });

        if(!user){
            return res.status(401).json({error: "Account doesn't exists"});
        }

        const isMatch = await comparePassword(password, user.password);

        if(!isMatch){
            return res.status(401).json({error: "Invalid credentials"})
        }

        
        const createdUser = await User.findById(user._id).select("-password");

        if (!createdUser) {
            return res.status(500).json({error: "Something went wrong while Logging in"});
        }

        
        const token = jwt.sign(
            {_id: user._id, role: user.role },
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );
        
        const options = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        };

        res.cookie('token', token, options);

        return res.status(200).json({message: "User Logged in", user: createdUser, token});

    }catch(error){
        console.log(error.message);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});



router.get('/logout', verifyJWT, (req, res) => {
    try{
        res.clearCookie('token');
        res.status(200).json({message: "Logged out successfully"});
    }catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
});




router.get('/verify', verifyJWT, async (req, res) => {
    try{
        const user = await User.findById(req.user?._id);
        const token = req.cookies?.token;
        return res.status(200).json({message: "User Logged in", user, token});
    }catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
})

export default router;
