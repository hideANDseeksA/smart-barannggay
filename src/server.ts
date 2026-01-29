import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import residentRoutes from "./routes/residents.routes";
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
import Purok from "./routes/purok.routes";
import authRoutes from "./routes/auth.routes";
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api/docs`);
});
