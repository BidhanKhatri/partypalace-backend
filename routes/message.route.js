import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getLeftSideMessageForAdmin,
  getMessage,
  sendMyMessage,
} from "../controllers/message.controller.js";

const messageRouter = Router();

messageRouter.post("/sendMyMessage", authMiddleware, sendMyMessage);
messageRouter.get("/getMessage", authMiddleware, getMessage);
messageRouter.get(
  "/getLeftMessagesAdmin",
  authMiddleware,
  getLeftSideMessageForAdmin
);

export default messageRouter;
