"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resident_id
 *               - password
 *             properties:
 *               resident_id:
 *                 type: string
 *                 example: "222"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clx123abc"
 *                     resident_id:
 *                       type: string
 *                       example: "222"
 *                     role:
 *                       type: string
 *                       example: "resident"
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not verified
 *       500:
 *         description: Server error
 */
router.post("/login", auth_controller_1.login);
exports.default = router;
