import mongoose from "mongoose";


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
        minLength : [3 ,"last name should be more than 3 litters"],
        maxLength : [18 ,"last name should be smaller than 18 litters"],
        trim : true,
        lowercase : true
    },
    age : { 
        type: Number,
        required : true,
        min: [18 , "Age must be greater than 18"],
        max: [100 , "Age must be less than 100"],
        index : 'idx_age'
    },
    email : {
        type : String,
        required : true,
        index : {name : 'idx_email', unique : true}
    },
    password : {
        type : String,
        required : true,
        minLength : [4 , "Password must be at least 6 characters long"]
    },
    gender : {
        type : String,
        enum : ["male" , "female"],
        default : "male"
    },
    role : {
        type : String,
        enum : ["user" , "admin"],
        default : "user"
    },
    phone : {
        type : String,
        required : true,
    },
    isConfirmed : {
        type : Boolean,
        default : false
    },
    otps : {
        confirmation : String,
        resetPassword : String
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

userSchema.index({firstName : 1 , lastName : 1} , {name : 'idx_fullName' , unique : true})

export const User = mongoose.model("user", userSchema);