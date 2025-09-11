import { User } from "../../../DB/Models/users.js";
import {BlacklistedToken} from "../../../DB/Models/blacklisted.tokens.js";
import bcrypt from "bcrypt";
import { encrypt , decrypt } from "../../../utils/encryption.js";
import {customAlphabet} from "nanoid";
import {emitter} from "../../../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

const customOtp = customAlphabet('1234567890', 8)


export const signUp = async (req, res) => {
    const {firstName ,lastName ,email ,password ,age ,phone ,gender} = req.body;
    const user =  await User.findOne({email})
    if(user){
        return res.status(400).json({message : "Email already exists"})
    }
    if(age < 18 || age > 100){
        return res.status(400).json({message : "Age must be between 18 and 100"})
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
    const user =  await User.findOne({email})
    if(!user){
        return res.status(400).json({message : "Invalid email or password"})
    }
    const isPasswordValid = bcrypt.compareSync(password , user.password)
    if(!isPasswordValid){
        return res.status(400).json({message : "Invalid email or password"})
    }
    
    const token = jwt.sign({ email : user.email , userId : user._id }, 'ashgobuasvd',{expiresIn : "1h" , jwtid : uuid()});
    
    const refreshToken = jwt.sign({ email : user.email , userId : user._id }, 'ashgobuasvd',{expiresIn : "1d" , jwtid : uuid()});
    res.status(200).json({message : "User signed in successfully" , accessToken : token , refreshToken});
}

export const confirm = async (req ,res) => {
    const decodedToken = req.decodedToken;
    const user = await User.findById(decodedToken.userId);
    if(!user){
        return res.status(400).json({message : "User not found"})
    }
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


export const updateUser = async (req ,res) => {
    const decodedToken = req.decodedToken;
    const user = await User.findById(decodedToken.userId);
    if(!user){
        return res.status(400).json({message : "User not found"})
    }
    const {firstName ,lastName ,email ,age ,phone} = req.body;
    if(firstName) {
        user.firstName = firstName
    }
    if (lastName) {
        user.lastName = lastName
    }
    if (email) {
        const userByEmail = await User.findOne({email})
        if(userByEmail){
            return res.status(400).json({message : "User already exists"})
        }
        user.email = email
    }
    if (age) {
        if(age < 18 || age > 100){
            return res.status(400).json({message : "Age must be between 18 and 100"})
        }
        user.age = age
    }
    if (phone) {
        user.phone = phone
    }
    await user.save();
    res.status(200).json({message : "User updated successfully"});
}


export const deleteUser = async (req ,res) => {
    const decodedToken = req.decodedToken;
    const user = await User.findById(decodedToken.userId);
    if(!user){
        return res.status(400).json({message : "User not found"})
    }
    await user.deleteOne();
    res.status(200).json({message : "User deleted successfully"});
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
    const newToken = jwt.sign({ email : decodedRefreshToken.email , userId : decodedRefreshToken.userId }, process.env.JWT_SECRET ,{expiresIn : "1h" , jwtid : uuid()});
    res.status(200).json({message : "the new token successfully generated" , accessToken : newToken});
}


export const logout = async (req ,res) => {
    const decodedToken = req.decodedToken;
    const refreshToken = req.headers.refresh_token;
    if(!refreshToken){
        return res.status(400).json({message : "Refresh token is required"})
    }
    const decodedRefreshToken = jwt.verify(refreshToken , process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId);
    if(!user){
        return res.status(400).json({message : "User not found"})
    }
    await BlacklistedToken.create([{tokenID : decodedToken.jti},{tokenID : decodedRefreshToken.jti}]);
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
    const confirmation_token = jwt.sign({ userId : user._id }, process.env.JWT_SECRET ,{expiresIn : "2m" , jwtid : uuid()});
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
