import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/superadmin.controller.js";

const superAdminRouter = Router();

superAdminRouter.post("/category/create", authMiddleware, createCategory);
superAdminRouter.put("/category/update", authMiddleware, updateCategory);
superAdminRouter.delete("/category/delete", authMiddleware, deleteCategory);

export default superAdminRouter;
