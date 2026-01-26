"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const residents_routes_1 = __importDefault(require("./routes/residents.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const document_types_routes_1 = __importDefault(require("./routes/document_types.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const certificates_routes_1 = __importDefault(require("./routes/certificates.routes"));
const complaints_routes_1 = __importDefault(require("./routes/complaints.routes"));
const health_records_routes_1 = __importDefault(require("./routes/health_records.routes"));
const health_appointments_routes_1 = __importDefault(require("./routes/health_appointments.routes"));
const pregnancy_monitoring_routes_1 = __importDefault(require("./routes/pregnancy_monitoring.routes"));
const purok_routes_1 = __importDefault(require("./routes/purok.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
    apis: [path_1.default.join(__dirname, "/routes/*.{ts,js}")],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Routes
app.get("/", (_req, res) => {
    res.json({ message: "Express + Prisma + TS 🚀" });
});
app.use("/api/residents", residents_routes_1.default);
app.use("/api", user_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/transactions", transaction_routes_1.default);
app.use("/api/documents", document_routes_1.default);
app.use("/api/document_types", document_types_routes_1.default);
app.use("/api/certificates", certificates_routes_1.default);
app.use("/api/complaints", complaints_routes_1.default);
app.use("/api/purok", purok_routes_1.default);
app.use("/api/health_records", health_records_routes_1.default);
app.use("/api/health_appointments", health_appointments_routes_1.default);
app.use("/api/pregnancy-monitoring", pregnancy_monitoring_routes_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api/docs`);
});
