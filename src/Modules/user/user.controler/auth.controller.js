import {Router} from "express";
import {authentication , validationMiddleware} from "../../../Middleware/index.js";
import * as userServices from "../sevices/auth.service.js";
import { signUpSchema } from "../../../Validation/Schemas/user.schema.js";


const userAuthRouter = Router();


userAuthRouter.post("/register", validationMiddleware(signUpSchema), userServices.signUp);
userAuthRouter.post("/login",userServices.signIn);
userAuthRouter.post("/confirm",authentication,userServices.confirm);
userAuthRouter.post("/logout",authentication,userServices.logout);
userAuthRouter.post("/refresh-token",userServices.refreshToken);
userAuthRouter.post("/reset-password",userServices.resestPassword);
userAuthRouter.post("/new-password",userServices.newPassword);
userAuthRouter.post("/gmail-auth",userServices.gmailAuth);


export {userAuthRouter};
