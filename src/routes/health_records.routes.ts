import express from "express"
import {
    createHealth_record,
    getHealth_records,
    getHealth_recordById,
    getHealth_recordsByResidentId,
    updateHealth_record,
    deleteHealth_record,
} from "../controllers/health_records.controller"
import { encryptFields } from "../middleware/encrypt.middleware"
import { decryptFields } from "../middleware/decrypt.middleware"

const router = express.Router()
const SENSITIVE_FIELDS = ["details"];
/**
 * @swagger
 * tags:
 *   name: Health Records
 *   description: Barangay health records management
 */

/**
 * @swagger
 * /api/health_records:
 *   post:
 *     summary: Create a new health record
 *     tags: [Health Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resident_id
 *             properties:
 *               resident_id:
 *                 type: string
 *               height_cm:
 *                 type: number
 *                 format: decimal
 *               weight_kg:
 *                 type: number
 *                 format: decimal
 *               blood_type:
 *                 type: string
 *               allergies:
 *                 type: string
 *               chronic_conditions:
 *                 type: string
 *               last_checkup:
 *                 type: string
 *                 format: date
 *               vaccination_status:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       201:
 *         description: Health record created successfully
 */
router.post("/", encryptFields(SENSITIVE_FIELDS), createHealth_record)

/**
 * @swagger
 * /api/health_records:
 *   get:
 *     summary: Get all health records
 *     tags: [Health Records]
 *     responses:
 *       200:
 *         description: List of health records
 */
router.get("/", decryptFields(SENSITIVE_FIELDS), getHealth_records)

/**
 * @swagger
 * /api/health_records/{id}:
 *   get:
 *     summary: Get health record by resident ID
 *     tags: [Health Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health record found
 *       404:
 *         description: Health record not found
 */
router.get("/:id", decryptFields(SENSITIVE_FIELDS), getHealth_recordsByResidentId)

/**
 * @swagger
 * /api/health_records/{id}:
 *   put:
 *     summary: Update health record
 *     tags: [Health Records]
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
 *               height_cm:
 *                 type: number
 *                 format: decimal
 *               weight_kg:
 *                 type: number
 *                 format: decimal
 *               blood_type:
 *                 type: string
 *               allergies:
 *                 type: string
 *               chronic_conditions:
 *                 type: string
 *               last_checkup:
 *                 type: string
 *                 format: date
 *               vaccination_status:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Health record updated
 */
router.put("/:id", encryptFields(SENSITIVE_FIELDS), updateHealth_record)

/**
 * @swagger
 * /api/health_records/{id}:
 *   delete:
 *     summary: Delete health record
 *     tags: [Health Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health record deleted
 */
router.delete("/:id", deleteHealth_record)

export default router
