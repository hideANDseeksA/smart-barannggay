import express from "express"
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
    generateTransactionCertificate,
    getTransactionByIds
} from "../controllers/transaction.controller"
import { encryptFields } from "../middleware/encrypt.middleware"
import { decryptFields } from "../middleware/decrypt.middleware"
import { rbac } from "../middleware/rbac"
import { authenticate } from "../middleware/auth.middleware"
const router = express.Router()
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

router.post(
  "/:id/generate",
  decryptFields(SENSITIVE_FIELDS),
  generateTransactionCertificate
)
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
router.post(
  "/",
  // authenticate,
  // rbac("admin", "staff", "resident"),
  encryptFields(SENSITIVE_FIELDS),
  createTransaction
);


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
router.get("/", decryptFields(SENSITIVE_FIELDS), getTransactions)

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
router.get("/:id", decryptFields(SENSITIVE_FIELDS), getTransactionById)



/**
 * @swagger
 * /api/transactions/user/{id}:
 *   get:
 *     summary: Get latest transactions by resident ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Resident UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   details:
 *                     type: string
 *                   status:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   certificate:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       template_name:
 *                         type: string
 *                       template_price:
 *                         type: number
 *       400:
 *         description: Invalid or missing resident ID
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */

router.get("/user/:id", decryptFields(SENSITIVE_FIELDS), getTransactionByIds)

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
router.put("/:id", updateTransaction)

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
router.delete("/:id", deleteTransaction)


export default router
