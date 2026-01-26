"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaError = void 0;
const client_1 = require("@prisma/client");
const handlePrismaError = (err, res) => {
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                res.status(409).json({ error: "Duplicate record" });
                return;
            case "P2025":
                res.status(404).json({ error: "Record not found" });
                return;
            case "P2003":
                res.status(400).json({ error: "Resident cannot be deleted" });
                return;
            default:
                res.status(400).json({
                    error: err.message,
                    code: err.code,
                });
                return;
        }
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
};
exports.handlePrismaError = handlePrismaError;
