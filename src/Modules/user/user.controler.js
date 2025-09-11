import {authentication} from "../../Middleware/authentication.js";
import {Router} from "express";
import * as userServices from "./sevices/users.services.js";


const userRouter = Router();


userRouter.post("/register", userServices.signUp);
userRouter.post("/login",userServices.signIn);
userRouter.post("/confirm",authentication,userServices.confirm);
userRouter.put("/update",authentication,userServices.updateUser);
userRouter.delete("/delete",authentication,userServices.deleteUser);
userRouter.post("/logout",authentication,userServices.logout);
userRouter.post("/refresh-token",userServices.refreshToken);
userRouter.post("/reset-password",userServices.resestPassword);
userRouter.post("/new-password",userServices.newPassword);



export default userRouter;
