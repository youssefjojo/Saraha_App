import {customAlphabet} from "nanoid";
import { User } from "../../../DB/Models/users.js";
import { encrypt , decrypt } from "../../../utils/encryption.js";


const customOtp = customAlphabet(process.env.OTP_PATTERN, +process.env.OTP_LENGTH)


export const updateUser = async (req ,res) => {
    const user = req.user;
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
        if(phone.length !== 11){
            console.log(phone.length);
            return res.status(400).json({message : "Phone number must be 11 characters long"})
        }
        user.phone = encrypt(phone)
    }
    await user.save();
    res.status(200).json({message : "User updated successfully"});
}


export const deleteUser = async (req ,res) => {
    const user = req.user;
    await user.deleteOne();
    res.status(200).json({message : "User deleted successfully"});
}

export const uploadAvatar = async (req ,res) => {
    console.log(req.file);
    console.log(req.body);
    res.status(200).json({message : "Avatar uploaded successfully"});
}