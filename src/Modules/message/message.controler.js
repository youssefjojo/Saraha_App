import {Router} from "express";
import * as messageServices from "./services/message.services.js";
import {authentication} from "../../Middleware/authentication.js";

const messageRouter = Router();

messageRouter.post("/send",authentication,messageServices.sendMessage);
messageRouter.get("/get",authentication,messageServices.getMessages);




export default messageRouter;
