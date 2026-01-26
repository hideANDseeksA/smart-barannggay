"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const document_controller_1 = require("../controllers/document.controller");
const encrypt_middleware_1 = require("../middleware/encrypt.middleware");
const decrypt_middleware_1 = require("../middleware/decrypt.middleware");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
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
router.post("/", upload_1.upload.single("file"), (0, encrypt_middleware_1.encryptFields)(SENSITIVE_FIELDS), document_controller_1.createDocuments);
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
router.get("/", (0, decrypt_middleware_1.decryptFields)(SENSITIVE_FIELDS), document_controller_1.getDocuments);
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
router.put("/:id", upload_1.upload.single("file"), (0, encrypt_middleware_1.encryptFields)(SENSITIVE_FIELDS), document_controller_1.updateDocuments);
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
router.delete("/:id", document_controller_1.deleteDocuments);
exports.default = router;
