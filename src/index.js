import "dotenv/config"
import express from "express"
import DB_connection from "./DB/DB.connection.js"
import userRouter from "./Modules/user/user.controler.js"
import messageRouter from "./Modules/message/message.controler.js"


//bjdphwcsdwjpvfpo
const app = express();

app.use(express.json());

DB_connection()


app.use("/user", userRouter);
app.use("/message", messageRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.cause || 500).json({
      message: "Something broke!",
      error: err.message,
      stack: err.stack,
    });
  });


// process.env.PORT

app.listen (+process.env.PORT, ()=>{
    console.log (`Server is running on port ${process.env.PORT}`);
})