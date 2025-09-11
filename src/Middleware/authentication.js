import jwt from "jsonwebtoken";


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
    req.decodedToken = decodedToken;
    next();
}