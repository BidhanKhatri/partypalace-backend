import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  changeBookingStatus,
  getBookingDetailsControllerAdmin,
} from "../controllers/admin.controller.js";
import { getAllPartyPalaceCreatedByAdmin } from "../controllers/partypalace.controller.js";

const adminRouter = Router();

adminRouter.get(
  "/get-bookings",
  authMiddleware,
  getBookingDetailsControllerAdmin
);
adminRouter.post(
  "/get-my-partypalace",
  authMiddleware,
  getAllPartyPalaceCreatedByAdmin
);
adminRouter.put("/update-status", authMiddleware, changeBookingStatus);

export default adminRouter;
