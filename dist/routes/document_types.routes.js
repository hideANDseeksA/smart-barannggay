"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const document_types_controller_1 = require("../controllers/document_types.controller");
const encrypt_middleware_1 = require("../middleware/encrypt.middleware");
const decrypt_middleware_1 = require("../middleware/decrypt.middleware");
const router = express_1.default.Router();
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
router.post("/", (0, encrypt_middleware_1.encryptFields)(SENSITIVE_FIELDS), document_types_controller_1.createDocument_types);
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
router.get("/", (0, decrypt_middleware_1.decryptFields)(SENSITIVE_FIELDS), document_types_controller_1.getDocument_types);
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
router.put("/:id", (0, encrypt_middleware_1.encryptFields)(SENSITIVE_FIELDS), document_types_controller_1.updateDocument_types);
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
router.delete("/:id", document_types_controller_1.deleteDocument_types);
exports.default = router;
