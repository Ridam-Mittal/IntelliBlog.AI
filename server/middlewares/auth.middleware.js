import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';

const verifyJWT = async (req, res, next) => {
    try{
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")

        if(!token){
            return res.status(401).send("Unauthorized request. User not logged In");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded?._id).select(" -password ");
        
        if(!user){
            return res.status(401).send("Invalid Token. User not logged In");
        }

        req.user = user;
        next();
    }catch(error){
        return res.status(403).send(error?.message || 'Invalid or expired token');
    }
}

export { verifyJWT };




/*

🔐 JWT Verification Middleware Blueprint
When writing JWT middleware:

Access the token from request headers.

Check if the token exists.

Verify the token using jwt.verify().

Attach user data to req for later use.

Call next() to continue to the route handler.

Handle errors properly.

*/