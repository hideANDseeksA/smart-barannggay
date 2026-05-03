import "module-alias/register";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";



import { initSocket } from "./socket/index";



dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://front-end-thesis-vert.vercel.app",
      "http://192.168.8.36:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Root route
app.get("/", (_req, res) => {
  res.json({
    message: "Express + Prisma + TS 🚀",
  });
});

// API Routes


// Server Start
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});