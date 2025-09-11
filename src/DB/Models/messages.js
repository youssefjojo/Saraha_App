import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content : String,
    receiverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }
},{
    timestamps : true
})

export const Message = mongoose.model("message", messageSchema);
