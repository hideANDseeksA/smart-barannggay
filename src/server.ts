import "module-alias/register"
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import residentRoutes from "@/modules/resident.modules/routes/residents.routes";
import userRoutes from "./routes/user.routes";
import documentRoutes from "./routes/document.routes";
import document_typesRoutes from "./routes/document_types.routes";
import transactionRoutes from "./routes/transaction.routes";
import certificatesRoutes from "./routes/certificates.routes";
import complaintsRoutes from "./routes/complaints.routes";
import HealthRecordsRoutes from "./routes/health_records.routes";
import HealthAppointmentRoutes from "./routes/health_appointments.routes";
import PregnancyMonitoringRoutes from "./routes/pregnancy_monitoring.routes";
import System_Setting from "./routes/system_settings.routes";
import BlotterRoutes from "./routes/blotter.routes";
import Purok from "./routes/purok.routes";
import authRoutes from "./routes/auth.routes";
import swaggerUi from "swagger-ui-express";
import GeneratorRoute from "./routes/generator.route";
import swaggerJsDoc from "swagger-jsdoc";
import path from "path";
import cookieParser from "cookie-parser";
import NotificationRoutes from "./routes/notification.routes";
import AnalyticsRoutes from "./routes/analytics.routes";
import { initSocket } from "./socket/index";
import http from "http"
import "./jobs/pregnancy.job"

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://front-end-thesis-vert.vercel.app","http://192.168.8.36:5173"],
    credentials: true,              
  })
);
app.use(express.json());
app.use(cookieParser());
const server = http.createServer(app)

// initialize socket
initSocket(server)
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
      {
        url: `${process.env.BASE_URL}`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(__dirname, "/routes/*.{ts,js}")],
};
const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get("/", (_req, res) => {
  res.json({ message: "Express + Prisma + TS 🚀" });
});

app.use("/api/residents", residentRoutes);
app.use("/api", userRoutes)
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/document_types", document_typesRoutes);
app.use("/api/certificates", certificatesRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/purok", Purok);
app.use("/api/health_records", HealthRecordsRoutes);
app.use("/api/health_appointments", HealthAppointmentRoutes);
app.use("/api/pregnancy-monitoring", PregnancyMonitoringRoutes);
app.use("/api/system", System_Setting);
app.use("/api/blotter",BlotterRoutes);
app.use("/api/generator", GeneratorRoute);
app.use("/api/notifications", NotificationRoutes);
app.use("/api/analytics", AnalyticsRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api/docs`);
});
