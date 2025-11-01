import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createReviewController,
  getReviewController,
  updateMyReviewController,
} from "../controllers/review.controller.js";

const reviewRouter = Router();

reviewRouter.post("/create", authMiddleware, createReviewController);
reviewRouter.get("/getReview", getReviewController);
reviewRouter.put("/updateReview", authMiddleware, updateMyReviewController);

export default reviewRouter;
