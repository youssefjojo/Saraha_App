import "dotenv/config"
import express from "express"
import helmet from "helmet"
import cors from "cors"
import DB_connection from "./DB/DB.connection.js"
import * as controller from "./Modules/controller.index.js"
import messageRouter from "./Modules/message/message.controler.js"
import {limiter} from "./Middleware/rate.limiter.middleware.js"






//bjdphwcsdwjpvfpo
const app = express();
app.use("/uploads", express.static("uploads"));
app.use(express.json());






const whiteList = process.env.WHITE_LIST;
// console.log (whiteList)
const corsOptions = {
    origin : function (origin , callback){
        if(whiteList.includes(origin)) {
            callback(null , true)
        }else{
            callback(new Error("Not allowed by CORS"))
        }
    }
}

app.use(cors(corsOptions));
app.use(helmet());
app.use(limiter)


DB_connection()


app.use("/api/user", controller.userRouter , controller.userAuthRouter);
app.use("/api/message", messageRouter);

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