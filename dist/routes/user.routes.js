"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Admin only)
 */
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users with linked resident information (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "clx123abc"
 *                   resident_id:
 *                     type: string
 *                     example: "222"
 *                   role:
 *                     type: string
 *                     example: "user"
 *                   verified:
 *                     type: boolean
 *                     example: true
 *                   resident:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "res123"
 *                       f_name:
 *                         type: string
 *                         example: "Juan"
 *                       l_name:
 *                         type: string
 *                         example: "Dela Cruz"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create a new user
 *     description: Create a user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
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
 *                 example: "StrongPassword123"
 *               role:
 *                 type: string
 *                 example: "resident"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clx123abc"
 *                 resident_id:
 *                   type: string
 *                   example: "222"
 *                 role:
 *                   type: string
 *                   example: "user"
 *                 verified:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post("/user", user_controller_1.createUser);
router.get("/user", user_controller_1.getUsers);
exports.default = router;
