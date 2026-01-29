import express from "express"
import {
  createPurok,
  getPurok,
  updatePurok,
  deletePurok,
} from "../controllers/purok.controller"
import { encryptFields } from "../middleware/encrypt.middleware";
import { decryptFields } from "../middleware/decrypt.middleware";
const router = express.Router()

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
router.post("/",createPurok)

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
router.get("/", getPurok)

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
router.put("/:id", updatePurok)

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
router.delete("/:id", deletePurok)

export default router
