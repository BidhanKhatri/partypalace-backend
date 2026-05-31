import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import userRouter from "./routes/user.route.js";
import partyPalaceRouter from "./routes/partypalace.route.js";
import bookingRouter from "./routes/booking.route.js";
import adminRouter from "./routes/admin.route.js";
import messageRouter from "./routes/message.route.js";
import aiRouter from "./routes/ai.route.js";
import superAdminRouter from "./routes/superadmin.route.js";
import globalRouter from "./routes/global.route.js";
import { app, server } from "./utils/socketConn.js";
import reviewRouter from "./routes/review.route.js";
import cameraManRouter from "./routes/cameraman.route.js";
import khaltiRouter from "./routes/khalti.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import { corsOptions } from "./config/cors.js";

dotenv.config();

// Trust first proxy (if behind a proxy like Nginx)
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use("/images", express.static("public/images"));
app.use(cookieParser());

// Dynamic CORS setup
app.use(cors(corsOptions));

// Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin", dashboardRouter);
app.use("/api/partypalace", partyPalaceRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/message", messageRouter);
app.use("/api/ai", aiRouter);
app.use("/api/superadmin", superAdminRouter);
app.use("/api/global", globalRouter);
app.use("/api/review", reviewRouter);
app.use("/api/khalti", khaltiRouter);

// app.use("/api/cameraman", cameraManRouter);

// Start server
const PORT = process.env.PORT || 4444;
server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
