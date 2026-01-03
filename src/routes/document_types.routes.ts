import express from "express";
import {
  createDocument_types,
  getDocument_types,
  updateDocument_types,
  deleteDocument_types,
} from "../controllers/document_types.controller";

import { encryptFields } from "../middleware/encrypt.middleware";
import { decryptFields } from "../middleware/decrypt.middleware";
const router = express.Router();
const SENSITIVE_FIELDS = ["name", "description"];

/**
 * @swagger
 * tags:
 *   name: Document_types
 *   description: Barangay Document_types management
 */

/**
 * @swagger
 * /api/document_types:
 *   post:
 *     summary: Create a new Document Type
 *     tags: [Document_types]
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
 *                 description: Unique name of the document type
 *               description:
 *                 type: string
 *                 description: Optional description of the document type
 *     responses:
 *       201:
 *         description: Document Type created successfully
 */
router.post("/", encryptFields(SENSITIVE_FIELDS), createDocument_types);

/**
 * @swagger
 * /api/document_types:
 *   get:
 *     summary: Get all Document Types
 *     tags: [Document_types]
 *     responses:
 *       200:
 *         description: List of Document Types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the document type
 *                   name:
 *                     type: string
 *                     description: Unique name of the document type
 *                   description:
 *                     type: string
 *                     description: Optional description of the document type
 */
router.get("/", decryptFields(SENSITIVE_FIELDS), getDocument_types);

/**
 * @swagger
 * /api/document_types/{id}:
 *   put:
 *     summary: Update a Document Type
 *     tags: [Document_types]
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
 *                 description: Unique name of the document type
 *               description:
 *                 type: string
 *                 description: Optional description of the document type
 *     responses:
 *       200:
 *         description: Document Type updated successfully
 */
router.put("/:id", encryptFields(SENSITIVE_FIELDS), updateDocument_types);

/**
 * @swagger
 * /api/document_types/{id}:
 *   delete:
 *     summary: Delete a Document Type
 *     tags: [Document_types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document Type deleted successfully
 */
router.delete("/:id", deleteDocument_types);

export default router;
