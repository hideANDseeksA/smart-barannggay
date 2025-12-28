"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.createUser = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/**
 * Create user
 */
const createUser = async (req, res) => {
    try {
        const user = await prisma_1.default.user.create({
            data: req.body,
        });
        return res.status(201).json(user);
    }
    catch (err) {
        console.error(err);
        // Prisma unique constraint or conflict
        if (err.code === "P2002") {
            return res.status(409).json({
                error: "User already exists",
            });
        }
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
exports.createUser = createUser;
/**
 * Get all users
 */
const getUsers = async (_req, res) => {
    try {
        const users = await prisma_1.default.user.findMany();
        return res.status(200).json(users);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
exports.getUsers = getUsers;
