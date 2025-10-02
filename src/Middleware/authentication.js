import jwt from "jsonwebtoken";
import { User } from "../DB/Models/users.js";
import { BlacklistedToken } from "../DB/Models/blacklisted.tokens.js";


export const authentication = async (req ,res ,next) => {
    const token = req.headers.access_token;
    if(!token){
        return res.status(400).json({message : "Token is required"})
    }
    const decodedToken = jwt.verify(token , process.env.JWT_SECRET);
    const jti = decodedToken.jti;

    const isBlacklisted = await BlacklistedToken.findOne({tokenID : jti});
    if(isBlacklisted){
        return res.status(400).json({message : "You are logged out"})
    }

    const user = await User.findById(decodedToken.userId);
    if(!user){
        return res.status(400).json({message : "User not found"})
    }
    req.user = user;
    req.token = {jti , exp : decodedToken.exp};
    next();
}