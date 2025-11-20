import { Router } from "express";
import { rateLimit } from "../middlewares/ratelimiter.middleware.js";
import {
  loginController,
  loginGoogleController,
  logoutController,
  signupController,
} from "../controllers/auth.controller.js";

const userRouter = Router();

const limitAuth = rateLimit({
  bucketSize: 1,
  refillRate: 1 / 60,
});

userRouter.post("/signup", limitAuth, signupController);
userRouter.post("/login", limitAuth, loginController);
userRouter.get("/login/google", loginGoogleController);
userRouter.get("/logout", logoutController);

export default userRouter;
