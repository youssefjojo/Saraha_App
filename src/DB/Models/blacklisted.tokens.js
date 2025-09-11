import mongoose from "mongoose";

const blacklistedTokensSchema = new mongoose.Schema({
    tokenID : String
})

export const BlacklistedToken = mongoose.model("blacklistedToken", blacklistedTokensSchema);
