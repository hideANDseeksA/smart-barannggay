import express from "express"
import {
  upsertsystem_setting,
  getsystem_setting,
  deletesystem_setting,
} from "../controllers/system_setting.controller"

import { encryptFields } from "../middleware/encrypt.middleware"
import { decryptFields } from "../middleware/decrypt.middleware"
import { upload } from "../middleware/upload"

const router = express.Router()

const SENSITIVE_FIELDS = ["web_name", "web_color", "barangay_status"]

/**
 * @swagger
 * tags:
 *   name: System Settings
 *   description: Global system configuration (singleton)
 */

/**
 * @swagger
 * /api/system:
 *   post:
 *     summary: Create or update system settings
 *     tags: [System Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               web_name:
 *                 type: string
 *               web_color:
 *                 type: string
 *               barangay_status:
 *                 type: string
 *               residentPrefix:
 *                 type: string
 *               residentNumberType:
 *                 type: string
 *               residentNumberLength:
 *                 type: integer
 *               residentNumber:
 *                 type: integer
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo file (PNG/JPG)
 *     responses:
 *       200:
 *         description: System settings saved successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  upload.single("logo"),
  encryptFields(SENSITIVE_FIELDS),
  upsertsystem_setting
)

/**
 * @swagger
 * /api/system:
 *   get:
 *     summary: Get system settings
 *     tags: [System Settings]
 *     responses:
 *       200:
 *         description: System settings retrieved successfully
 */
router.get("/", decryptFields(SENSITIVE_FIELDS), getsystem_setting)

/**
 * @swagger
 * /api/system:
 *   delete:
 *     summary: Delete system settings (reset)
 *     tags: [System Settings]
 *     responses:
 *       200:
 *         description: System settings deleted successfully
 *       404:
 *         description: System settings not found
 */
router.delete("/", deletesystem_setting)

export default router
