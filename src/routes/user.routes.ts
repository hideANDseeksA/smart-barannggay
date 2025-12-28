import { Router } from "express";
import { createUser, getUsers } from "../controllers/user.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management routes
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
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
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Jhon Doe"
 *                   email:
 *                     type: string
 *                     example: "jhon@example.com"
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resident_id:
 *                 type: string
 *                 example: "Jhon Doe"
 *               password:
 *                 type: string
 *                 example: "jhon@example.com"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 resident_id:
 *                   type: string
 *                   example: "Jhon Doe"
 *                 password:
 *                   type: string
 *                   example: "jhon@example.com"
 */

router.get("/", getUsers);
router.post("/", createUser);

export default router;
