import {OAuth2Client} from "google-auth-library"
import jwt from "jsonwebtoken";
import {customAlphabet} from "nanoid";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import { User , BlacklistedToken } from "../../../DB/Models/index.js";
import { encrypt , emitter } from "../../../utils/index.js";
import {ProviderEnum} from "../../../Common/enums/user.enum.js";

const customOtp = customAlphabet(process.env.OTP_PATTERN, +process.env.OTP_LENGTH)


export const signUp = async (req, res) => {
    const {firstName ,lastName ,email ,password ,confirmPassword ,age ,phone ,gender} = req.body;
    const user =  await User.findOne({email , provider : ProviderEnum.LOCAL})
    if(user){
        return res.status(400).json({message : "Email already exists"})
    }
    if(age < 18 || age > 100){
        return res.status(400).json({message : "Age must be between 18 and 100"})
    }
    if (password !== confirmPassword){
        return res.status(400).json({message : "Passwords do not match"})
    }
    if(phone.length !== 11){
        return res.status(400).json({message : "Phone number must be 11 characters long"})
    }
    const encryptedPhone = encrypt(phone)
    const newUser = new User({
        firstName,
        lastName,
        email,
        password : bcrypt.hashSync(password , +process.env.SALT_ROUNDS),
        age,
        phone : encryptedPhone,
        gender
    })
    const otp = customOtp()
    newUser.otps.confirmation = bcrypt.hashSync(otp , +process.env.SALT_ROUNDS)
    
    
    //send email
    emitter.emit("sendEmail" , {
        to : email,
        subject : "Confirmation OTP",
        html : `<h1>Your confirmation OTP is : ${otp}</h1>`
    })
    await newUser.save()

    res.status(201).json({message : "User registered successfully"})
}

export const signIn = async (req ,res) => {
    const {email ,password} = req.body;
    const user =  await User.findOne({email , provider : ProviderEnum.LOCAL})
    if(!user){
        return res.status(400).json({message : "Invalid email or password"})
    }
    const isPasswordValid = bcrypt.compareSync(password , user.password)
    if(!isPasswordValid){
        return res.status(400).json({message : "Invalid email or password"})
    }
    
    const token = jwt.sign({ email : user.email , userId : user._id }, process.env.TOKEN_KEY,{expiresIn : "1h" , jwtid : uuid()});
    
    const refreshToken = jwt.sign({ email : user.email , userId : user._id }, process.env.TOKEN_KEY,{expiresIn : "1d" , jwtid : uuid()});
    res.status(200).json({message : "User signed in successfully" , accessToken : token , refreshToken});
}

export const confirm = async (req ,res) => {
    const user = req.user;
    if(user.isConfirmed){
        return res.status(400).json({message : "User already confirmed"})
    }
    console.log(req.body.otp);
    console.log(user.otps.confirmation);
    const isValidOTP = bcrypt.compareSync(req.body.otp , user.otps.confirmation);
    if(!isValidOTP){
        return res.status(400).json({message : "Invalid OTP"})
    }
    user.otps.confirmation = undefined;
    user.isConfirmed = true;
    user.save();
    res.status(200).json({message : "User confirmed successfully"});
}


export const refreshToken = async (req ,res) => {
    const refreshToken = req.headers.refresh_token;
    if(!refreshToken){
        return res.status(400).json({message : "Refresh token is required"})
    }
    const decodedRefreshToken = jwt.verify(refreshToken , process.env.JWT_SECRET);
    const jti = decodedRefreshToken.jti;
    const isBlacklisted = await BlacklistedToken.findOne({tokenID : jti});
    console.log(isBlacklisted);
    if(isBlacklisted){
        return res.status(400).json({message : "You are logged out"})
    }
    const newToken = jwt.sign({ email : decodedRefreshToken.email , userId : decodedRefreshToken.userId }, process.env.TOKEN_KEY ,{expiresIn : "1h" , jwtid : uuid()});
    res.status(200).json({message : "the new token successfully generated" , accessToken : newToken});
}


export const logout = async (req ,res) => {
    const user = req.user;
    const {jti} = req.token;
    const refreshToken = req.headers.refresh_token;
    if(!refreshToken){
        return res.status(400).json({message : "Refresh token is required"})
    }
    const decodedRefreshToken = jwt.verify(refreshToken , process.env.JWT_SECRET);
    
    await BlacklistedToken.create([{tokenID :jti},{tokenID : decodedRefreshToken.jti}]);
    res.status(200).json({message : "User logged out successfully"});
}

export const resestPassword = async (req ,res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({message : "User not found"})
    }
    const otp = customOtp()
    user.otps.resetPassword = bcrypt.hashSync(otp , +process.env.SALT_ROUNDS)
    await user.save()
    emitter.emit("sendEmail" , {
        to : email,
        subject : "Reset Password OTP",
        html : `<h1>Your reset password OTP is : ${otp}</h1>`
    })
    const confirmation_token = jwt.sign({ userId : user._id }, process.env.TOKEN_KEY ,{expiresIn : "2m" , jwtid : uuid()});
    res.status(200).json({message : "Reset password OTP sent successfully" , confirmation_token});
}


export const newPassword = async (req ,res) => {
    const {otp , newPassword , confirmNewPassword } = req.body;
    const token = req.headers.confirmation_token;
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

    const isValidOTP = bcrypt.compareSync(otp , user.otps.resetPassword);
    if(!isValidOTP){
        return res.status(400).json({message : "Invalid OTP"})
    }

    if (newPassword !== confirmNewPassword){
        return res.status(400).json({message : "Passwords do not match"})
    }

    user.password = bcrypt.hashSync(newPassword , +process.env.SALT_ROUNDS)
    user.otps.resetPassword = undefined
    await user.save()
    await BlacklistedToken.create([{tokenID : jti}]);
    res.status(200).json({message : "Password reset successfully"})
}


export const gmailAuth = async (req ,res) => {
    const {idToken} = req.body;
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken,
        audience : process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const {sub , email ,given_name : firstName , family_name : lastName } = payload;
    const user = await User.findOne({GoogleSub : sub , provider : ProviderEnum.GOOGLE})
    console.log(user)
    if(user){

        user.email = email
        user.firstName = firstName
        user.lastName = lastName
        await user.save()


        const token = jwt.sign({ email : user.email , userId : user._id }, process.env.TOKEN_KEY,{expiresIn : "1h" , jwtid : uuid()});
        const refreshToken = jwt.sign({ email : user.email , userId : user._id }, process.env.TOKEN_KEY,{expiresIn : "1d" , jwtid : uuid()});
        res.status(200).json({message : "User signed in successfully" , accessToken : token , refreshToken});
    } else{
        
        const userByEmail = await User.findOne({email})
        if(userByEmail){
            return res.status(400).json({message : "User already exists"})
        }
        const newUser = new User({
        GoogleSub : sub,
        email,
        firstName,
        lastName,
        provider : ProviderEnum.GOOGLE,
        isConfirmed : true,
        password : Math.random().toString(36).slice(2)
    })
    await newUser.save()
}
    res.status(200).json({message : "User signed in successfully"});
    
}