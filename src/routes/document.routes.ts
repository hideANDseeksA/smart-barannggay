import express from "express";
import {
  createDocuments,
  getDocuments,
  updateDocuments,
  deleteDocuments,
} from "../controllers/document.controller";

import { encryptFields } from "../middleware/encrypt.middleware";
import { decryptFields } from "../middleware/decrypt.middleware";
import { upload } from "../middleware/upload";

const router = express.Router();
const SENSITIVE_FIELDS = ["title", "purpose"];

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Barangay Documents management
 */

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Create a new Document
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - document_type_id
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *               document_type_id:
 *                 type: string
 *               purpose:
 *                 type: string
 *               issued_date:
 *                 type: string
 *                 format: date-time
 *               expiration_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Certificate template file (PDF/DOCX)
 *     responses:
 *       201:
 *         description: Document created successfully
 *       400:
 *         description: Template file is required
 *       500:
 *         description: Internal server error
 */
router.post("/", upload.single("file"), encryptFields(SENSITIVE_FIELDS), createDocuments);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all Documents
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: List of Documents
 */
router.get("/", decryptFields(SENSITIVE_FIELDS), getDocuments);

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Update Document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document_type_id:
 *                 type: string
 *               title:
 *                 type: string
 *               purpose:
 *                 type: string
 *               issued_date:
 *                 type: string
 *                 format: date-time
 *               expiration_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Certificate template file (PDF/DOCX)
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", upload.single("file"), encryptFields(SENSITIVE_FIELDS), updateDocuments);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete Document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 */
router.delete("/:id", deleteDocuments);

export default router;
