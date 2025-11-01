import { Router } from "express";
import {
  loginController,
  loginGoogleController,
  logoutController,
  signupController,
} from "../controllers/auth.controller.js";

const userRouter = Router();

userRouter.post("/signup", signupController);
userRouter.post("/login", loginController);
userRouter.get("/login/google", loginGoogleController);
userRouter.get("/logout", logoutController);

export default userRouter;
