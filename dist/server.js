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
            { url: `http://localhost:${process.env.PORT || 5000}` },
        ],
    },
    apis: [path_1.default.join(__dirname, "/routes/*.{ts,js}")], // auto-detect all route files
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Routes
app.get("/", (_req, res) => {
    res.json({ message: "Express + Prisma + TS 🚀" });
});
app.use("/api/residents", residents_routes_1.default);
app.use("/api/users", user_routes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api/docs`);
});
