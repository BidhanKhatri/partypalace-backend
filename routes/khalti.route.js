import { Router } from "express";
import {
  initiateKhaltiPaymentController,
  lookupKhaltiPaymentController,
} from "../controllers/khalti.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const khaltiRouter = Router();

khaltiRouter.post("/initiate", authMiddleware, initiateKhaltiPaymentController);
khaltiRouter.post("/lookup", authMiddleware, lookupKhaltiPaymentController);

export default khaltiRouter;
