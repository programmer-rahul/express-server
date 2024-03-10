import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { createServer } from "http";
import { Server } from "socket.io";
import { mountSocketIO } from "./socket/index.js";

import errorHandler from "./middlewares/error.middleware.js";

const app = express();
const httpServer = createServer(app);

// socket io
const io = new Server(httpServer, {
  pingTimeout: 50000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

app.set("io", io);

// middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
  })
);
app.use(express.json({ limit: "14kb" }));
app.use(express.urlencoded({ extended: true, limit: "14kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes
import userRouter from "./routes/user.route.js";

app.use("/api/v1/user", userRouter);

// socket
mountSocketIO(io);

// middleware for error handling
app.use(errorHandler);

export default httpServer;
