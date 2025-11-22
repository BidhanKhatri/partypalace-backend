import { Router } from "express";
import { khaltiController } from "../controllers/khalti.controller.js";
const khaltiRouter = Router();

khaltiRouter.post("/verify", khaltiController);

export default khaltiRouter;
