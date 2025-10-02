import {Router} from "express";
import * as userServices from "../sevices/users.services.js";
import {localUpload} from "../../../Middleware/index.js";
import { authentication } from "../../../Middleware/index.js";

const userRouter = Router();

userRouter.put("/update", authentication ,userServices.updateUser);
userRouter.delete("/delete", authentication ,userServices.deleteUser);
userRouter.post("/upload-avatar", localUpload({folderPath : "profile"}).single("profile"),userServices.uploadAvatar);


export {userRouter};
