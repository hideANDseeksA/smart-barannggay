import {getNotificationsByRole, createNotification,getNotificationsByResidentId, updateNotification, deleteNotification} from '../controllers/notification.controller'
import express from 'express'
import { encryptFields } from '../middleware/encrypt.middleware'
import { decryptFields } from '../middleware/decrypt.middleware'
const router = express.Router()
const SENSITIVE_FIELDS = ["content"];


router.post("/", encryptFields(SENSITIVE_FIELDS), createNotification)
router.get("/resident/:resident_id", decryptFields(SENSITIVE_FIELDS), getNotificationsByResidentId)
router.get("/:receiver", decryptFields(SENSITIVE_FIELDS), getNotificationsByRole)
router.put("/:id", encryptFields(SENSITIVE_FIELDS), updateNotification)
router.delete("/:id", deleteNotification)

export default router