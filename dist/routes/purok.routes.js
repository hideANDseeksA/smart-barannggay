"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const purok_controller_1 = require("../controllers/purok.controller");
const encrypt_middleware_1 = require("../middleware/encrypt.middleware");
const decrypt_middleware_1 = require("../middleware/decrypt.middleware");
const router = express_1.default.Router();
const SENSITIVE_FIELDS = ["name"];
/**
 * @swagger
 * tags:
 *   name: Purok
 *   description: Barangay Purok management
 */
/**
 * @swagger
 * /api/purok:
 *   post:
 *     summary: Create a new Purok
 *     tags: [Purok]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name of the purok
 *     responses:
 *       201:
 *         description: Purok created successfully
 */
router.post("/", (0, encrypt_middleware_1.encryptFields)(SENSITIVE_FIELDS), purok_controller_1.createPurok);
/**
 * @swagger
 * /api/purok:
 *   get:
 *     summary: Get all Puroks
 *     tags: [Purok]
 *     responses:
 *       200:
 *         description: List of puroks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Purok ID
 *                   name:
 *                     type: string
 *                     description: Purok name
 */
router.get("/", (0, decrypt_middleware_1.decryptFields)(SENSITIVE_FIELDS), purok_controller_1.getPurok);
/**
 * @swagger
 * /api/purok/{id}:
 *   put:
 *     summary: Update a Purok
 *     tags: [Purok]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated purok name
 *     responses:
 *       200:
 *         description: Purok updated successfully
 */
router.put("/:id", purok_controller_1.updatePurok);
/**
 * @swagger
 * /api/purok/{id}:
 *   delete:
 *     summary: Delete a Purok
 *     tags: [Purok]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purok deleted successfully
 */
router.delete("/:id", purok_controller_1.deletePurok);
exports.default = router;
