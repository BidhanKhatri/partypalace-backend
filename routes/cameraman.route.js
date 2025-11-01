import { Router } from "express";
import {
  bookCameraMan,
  createCameraManController,
  findNearestCameraMan,
  getAllCameraMan,
  getUnavailableDates,
} from "../controllers/cameraman.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const cameraManRouter = Router();

cameraManRouter.post(
  "/create",
  upload.single("profileImage"),
  createCameraManController
);
cameraManRouter.get("/find-nearest-cameraman", findNearestCameraMan);
cameraManRouter.get("/get-all", getAllCameraMan);
cameraManRouter.post("/book-cameraman", authMiddleware, bookCameraMan);
cameraManRouter.get(
  "/get-unavailable-dates/:cameraManId",
  authMiddleware,
  getUnavailableDates
);

export default cameraManRouter;
