"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.createUser = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const hash_util_1 = require("../utils/hash.util");
const crypto_util_1 = require("../utils/crypto.util");
/**
 * Create user (Admin only)
 */
const createUser = async (req, res) => {
    try {
        const { resident_id, password, role } = req.body;
        const resident = await prisma_1.default.residents.findUnique({
            where: { resident_id: resident_id },
        });
        if (!resident) {
            res.status(404).json({ error: "Resident not found" });
            return;
        }
        if (!resident_id || !password) {
            res.status(400).json({ error: "resident_id and password are required" });
            return;
        }
        // Hash password
        const hashedPassword = await (0, hash_util_1.hashData)(password);
        const user = await prisma_1.default.user.create({
            data: {
                resident_id: resident.id,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                resident_id: true,
                role: true,
                verified: true,
            }, // ❌ never return password
        });
        res.status(201).json(user);
    }
    catch (err) {
        console.error(err);
        if (err.code === "P2002") {
            res.status(409).json({ error: "User already exists" });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createUser = createUser;
const getUsers = async (_req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                resident_id: true,
                role: true,
                verified: true,
                resident: {
                    select: {
                        id: true,
                        resident_id: true,
                        f_name: true,
                        l_name: true,
                        email_address: true,
                    },
                },
            },
        });
        res.status(200).json((0, crypto_util_1.decryptAll)(users));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getUsers = getUsers;
