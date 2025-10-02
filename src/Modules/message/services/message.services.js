import {Message , User} from "../../../DB/Models/index.js";

export const sendMessage = async (req ,res) => {
    const { content , receiverId } = req.body;
    const receiver = await User.findById(receiverId);
    if(!receiver){
        return res.status(400).json({message : "Receiver not found"})
    }
    const message = new Message({
        content,
        receiverId
    })
    await message.save();
    res.status(200).json({message : "Message sent successfully"});
}


export const getMessages = async (req ,res) => {
    const decodedToken = req.decodedToken;
    const user = await User.findById(decodedToken.userId);
    if(!user){
        return res.status(400).json({message : "User not found"})
    }
    const messages = await Message.find({receiverId : user._id} , {content : 1 , receiverId : 1 , createdAt : 1});
    res.status(200).json(messages);
}