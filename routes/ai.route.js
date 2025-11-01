import { Router } from "express";
import {
  AISuggetPartyPalaceController,
  DeepSeekSuggestPartyPalace,
} from "../controllers/ai.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const aiRouter = Router();

aiRouter.post("/suggest", authMiddleware, AISuggetPartyPalaceController);
aiRouter.post("/deepseek/suggest", authMiddleware, DeepSeekSuggestPartyPalace);

export default aiRouter;
