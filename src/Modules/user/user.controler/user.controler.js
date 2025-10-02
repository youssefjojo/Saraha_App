import {Router} from "express";
import {authentication} from "../../../Middleware/authentication.js";
import * as userServices from "../sevices/users.services.js";


const userRouter = Router();

userRouter.put("/update", authentication ,userServices.updateUser);
userRouter.delete("/delete", authentication ,userServices.deleteUser);



export {userRouter};
