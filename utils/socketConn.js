import express from "express";
import http from "http";
import { Server } from "socket.io";
import { socketCorsOptions } from "../config/cors.js";
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: socketCorsOptions,
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("❌ User disconnected:", socket.id, "Reason:", reason);
  });
});

export { app, io, server };
