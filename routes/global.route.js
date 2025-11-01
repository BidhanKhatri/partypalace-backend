import { Router } from "express";
import { getAllCategoryController } from "../controllers/global.controller.js";

const globalRouter = Router();

globalRouter.get("/category/get", getAllCategoryController);

export default globalRouter;
