"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_util_1 = require("../utils/jwt.util"); // adjust path if needed
const login = async (req, res) => {
    try {
        const { resident_id, password } = req.body;
        const resident = await prisma_1.default.residents.findUnique({
            where: { resident_id },
        });
        if (!resident) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: { resident_id: resident?.id },
        });
        if (!user || !user.password) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        if (!user.verified) {
            res.status(403).json({ error: "Account not verified" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = (0, jwt_util_1.signToken)({
            id: user.id,
            role: user.role,
        });
        res.json({
            token,
            user: {
                id: user.id,
                resident_id: user.resident_id,
                role: user.role,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
};
exports.login = login;
