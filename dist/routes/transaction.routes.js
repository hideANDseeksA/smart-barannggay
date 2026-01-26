"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaction_controller_1 = require("../controllers/transaction.controller");
const encrypt_middleware_1 = require("../middleware/encrypt.middleware");
const decrypt_middleware_1 = require("../middleware/decrypt.middleware");
const rbac_1 = require("../middleware/rbac");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const SENSITIVE_FIELDS = ["details"];
/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Barangay transactions management
 */
/**
 * @swagger
 * /api/transactions/{id}/generate:
 *   post:
 *     summary: Generate certificate from DOCX template
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate generated successfully
 *       404:
 *         description: Transaction not found
 *       403:
 *         description: Forbidden
 */
router.post("/:id/generate", (0, decrypt_middleware_1.decryptFields)(SENSITIVE_FIELDS), transaction_controller_1.generateTransactionCertificate);
/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
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
 *               - certificate_id
 *               - details
 *             properties:
 *               resident_id:
 *                 type: string
 *                 example: "uuid-resident-id"
 *               certificate_id:
 *                 type: string
 *                 example: "uuid-certificate-id"
 *               details:
 *                 type: string
 *                 example: "Barangay Clearance Request"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", auth_middleware_1.authenticate, (0, rbac_1.rbac)("admin", "staff", "resident"), (0, encrypt_middleware_1.encryptFields)(SENSITIVE_FIELDS), transaction_controller_1.createTransaction);
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/", (0, decrypt_middleware_1.decryptFields)(SENSITIVE_FIELDS), transaction_controller_1.getTransactions);
/**
 * @swagger
 * /api/transactions/{resident_id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: resident_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction found
 *       404:
 *         description: Transaction not found
 */
router.get("/:id", (0, decrypt_middleware_1.decryptFields)(SENSITIVE_FIELDS), transaction_controller_1.getTransactionById);
/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update transaction
 *     tags: [Transactions]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated
 */
router.put("/:id", transaction_controller_1.updateTransaction);
/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted
 */
router.delete("/:id", transaction_controller_1.deleteTransaction);
exports.default = router;
