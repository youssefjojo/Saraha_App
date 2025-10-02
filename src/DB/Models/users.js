import mongoose from "mongoose";
import { ProviderEnum  , GenderEnum , RoleEnum} from "../../Common/enums/user.enum.js";


const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
        minLength : [3 ,"first name should be more than 3 litters"],
        maxLength : [18 ,"first name should be smaller than 18 litters"],
        trim : true,
        lowercase : true
    },
    lastName : {
        type : String,
        required : true,
        lowercase : true
    },
    age : { 
        type: Number,
        // required : true,
        min: [18 , "Age must be greater than 18"],
        max: [100 , "Age must be less than 100"],
        index : 'idx_age'
    },
    email : {
        type : String,
        required : true,
        index : {name : 'idx_email', unique : true}
    },
    GoogleSub : {
        type : String,
        default : undefined
    },
    password : {
        type : String,
        required : true,
        minLength : [8 , "Password must be at least 6 characters long"]
    },
    gender : {
        type : String,
        enum : Object.values(GenderEnum),
        default : GenderEnum.MALE
    },
    role : {
        type : String,
        enum : Object.values(RoleEnum),
        default : RoleEnum.USER
    },
    phone : {
        type : String,
    },
    isConfirmed : {
        type : Boolean,
        default : false
    },
    otps : {
        confirmation : String,
        resetPassword : String
    },
    provider : {
        type : String,
        enum : Object.values(ProviderEnum),
        default : ProviderEnum.LOCAL
    }
},{
    timestamps : true,
    virtuals : {
        fullName : {
            get () {
                return this.firstName + " " + this.lastName
            }
        }
    }
})

// userSchema.index({firstName : 1 , lastName : 1} , {name : 'idx_fullName' , unique : true})

export const User = mongoose.model("user", userSchema);