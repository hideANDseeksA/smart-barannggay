import express from "express"
import {
  createTransaction,
  getAppointment,
  getOnlineRequest,
  getTransactionById,
  getHistory,
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




router.post(
  "/:id/generate",
  decryptFields(SENSITIVE_FIELDS),
  authenticate,
  rbac("admin", "staff"),
  generateTransactionCertificate
)

router.post(
  "/",
  authenticate,
  rbac("admin", "staff", "resident"),
  encryptFields(SENSITIVE_FIELDS),
  createTransaction
);

router.get("/appointment-test", 
  decryptFields(SENSITIVE_FIELDS),
  authenticate,
  rbac("admin", "staff"),
  getAppointment)

router.get("/history", 
  decryptFields(SENSITIVE_FIELDS),
    authenticate,
    rbac("admin", "staff"),
     getHistory)

router.get("/", 
  decryptFields(SENSITIVE_FIELDS),
    authenticate,
    rbac("admin", "staff"),
   getOnlineRequest)




router.get("/:id",
   decryptFields(SENSITIVE_FIELDS),
     authenticate,
     rbac("admin", "staff"),
    getTransactionById)



router.get("/user/:id", 
  decryptFields(SENSITIVE_FIELDS),
    authenticate,
  rbac("admin", "staff", "resident"),
   getTransactionByIds)


router.put("/:id",
    authenticate,
  rbac("admin", "staff", "resident"),
   updateTransaction)


router.delete("/:id",
    authenticate,
    rbac("admin", "staff"),
   deleteTransaction)


export default router
