import { Router } from "express";
import { getDashboardData } from "../controllers/dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.get("/dashboard", getDashboardData);

export default dashboardRouter;
