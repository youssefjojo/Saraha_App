import mongoose from "mongoose"

// console.log(process.env.MONGO_URL)
const DB_connection = async () => {
    try{
    await mongoose.connect(process.env.MONGO_URL);
    }catch (error){
        console.log("DB Connection Error", error);
    }
  }

  export default DB_connection;