import { Router } from "express"
import {
  generateTransactionCertificate,
  createAndGenerateCertificate,
  updateAndGenerateCertificate,
} from "../controllers/form.generator.controller"
import { encryptFields } from "../middleware/encrypt.middleware"
const router = Router()
const SENSITIVE_FIELDS = ["details"];
// 🔹 Generate certificate from existing transaction
// GET /api/transactions/:id/generate
router.get(
  "/transactions/:id/generate",
  generateTransactionCertificate
)

// 🔹 Create transaction + generate certificate
// POST /api/transactions/generate
router.post(
  "/transactions/generate",
    encryptFields(SENSITIVE_FIELDS),
  createAndGenerateCertificate
)

// 🔹 Update transaction + generate certificate
// PUT /api/transactions/:id/generate
router.put(
  "/transactions/:id/generate",
    encryptFields(SENSITIVE_FIELDS),
  updateAndGenerateCertificate
)

export default router