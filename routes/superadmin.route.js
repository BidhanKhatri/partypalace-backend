import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createCategory,
  deleteCategory,
  getAllPartyPalaceForSuperAdmin,
  getCategory,
  updateCategory,
  verifyPartyPalace,
} from "../controllers/superadmin.controller.js";

const superAdminRouter = Router();

superAdminRouter.post("/category/create", authMiddleware, createCategory);
superAdminRouter.get("/category/get", authMiddleware, getCategory);
superAdminRouter.put("/category/update", authMiddleware, updateCategory);
superAdminRouter.delete("/category/delete", authMiddleware, deleteCategory);
superAdminRouter.get("/partypalaces", authMiddleware, getAllPartyPalaceForSuperAdmin)
superAdminRouter.put("/partypalace/verify", authMiddleware, verifyPartyPalace)

export default superAdminRouter;
