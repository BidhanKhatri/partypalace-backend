import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  cancleBookingController,
  createBookingController,
  getBookingDetailsController,
  updateBookingController,
} from "../controllers/booking.controller.js";

const bookingRouter = Router();

bookingRouter.post("/create", authMiddleware, createBookingController);
bookingRouter.patch("/update", authMiddleware, updateBookingController);
bookingRouter.get("/get", authMiddleware, getBookingDetailsController);
bookingRouter.delete(
  "/cancel/:bookingId",
  authMiddleware,
  cancleBookingController
);

export default bookingRouter;
