import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import residentRoutes from "./routes/residents.routes";
import userRoutes from "./routes/user.routes";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Barangay API",
      version: "1.0.0",
      description: "Express + Prisma + TypeScript API",
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}` },
    ],
  },
  apis: [path.join(__dirname, "/routes/*.{ts,js}")], // auto-detect all route files
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get("/", (_req, res) => {
  res.json({ message: "Express + Prisma + TS 🚀" });
});

app.use("/api/residents", residentRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api/docs`);
});
