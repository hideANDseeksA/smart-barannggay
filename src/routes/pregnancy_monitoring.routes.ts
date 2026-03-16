import express from "express"
import {
  createPregnancy_monitoring,
  getPregnancy_monitoring,
  getPregnancy_monitoringById,
  updatePregnancy_monitoring,
  deletePregnancy_monitoring,
} from "../controllers/pregnancy_monitoring.controller"
import { decryptFields } from "../middleware/decrypt.middleware"
import { encryptFields } from "../middleware/encrypt.middleware"

const router = express.Router()
const SENSITIVE_FIELDS =["details"]

/**
 * @swagger
 * tags:
 *   name: PregnancyMonitoring
 *   description: Pregnancy monitoring management
 */

/**
 * @swagger
 * /api/pregnancy-monitoring:
 *   post:
 *     summary: Create a new pregnancy monitoring record
 *     tags: [PregnancyMonitoring]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pregnancy_start_date
 *               - expected_delivery_date
 *             properties:
 *               health_record_id:
 *                 type: string
 *                 nullable: true
 *               pregnancy_start_date:
 *                 type: string
 *                 format: date
 *               expected_delivery_date:
 *                 type: string
 *                 format: date
 *               current_trimester:
 *                 type: integer
 *                 nullable: true
 *               complications:
 *                 type: string
 *                 nullable: true
 *               checkup_notes:
 *                 type: string
 *                 nullable: true
 *               last_checkup:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pregnancy monitoring record created successfully
 */
router.post("/", encryptFields(SENSITIVE_FIELDS), createPregnancy_monitoring)

/**
 * @swagger
 * /api/pregnancy-monitoring:
 *   get:
 *     summary: Get all pregnancy monitoring records
 *     tags: [PregnancyMonitoring]
 *     responses:
 *       200:
 *         description: List of pregnancy monitoring records
 */
router.get("/", decryptFields(SENSITIVE_FIELDS), getPregnancy_monitoring)

/**
 * @swagger
 * /api/pregnancy-monitoring/{id}:
 *   get:
 *     summary: Get pregnancy monitoring records by health record ID
 *     tags: [PregnancyMonitoring]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pregnancy monitoring records found
 *       404:
 *         description: Pregnancy monitoring records not found
 */
router.get("/:id", decryptFields(SENSITIVE_FIELDS), getPregnancy_monitoringById)

/**
 * @swagger
 * /api/pregnancy-monitoring/{id}:
 *   put:
 *     summary: Update a pregnancy monitoring record
 *     tags: [PregnancyMonitoring]
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
 *               pregnancy_start_date:
 *                 type: string
 *                 format: date
 *               expected_delivery_date:
 *                 type: string
 *                 format: date
 *               current_trimester:
 *                 type: integer
 *                 nullable: true
 *               complications:
 *                 type: string
 *                 nullable: true
 *               checkup_notes:
 *                 type: string
 *                 nullable: true
 *               last_checkup:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pregnancy monitoring record updated successfully
 */
router.put("/:id", encryptFields(SENSITIVE_FIELDS), updatePregnancy_monitoring)

/**
 * @swagger
 * /api/pregnancy-monitoring/{id}:
 *   delete:
 *     summary: Delete a pregnancy monitoring record
 *     tags: [PregnancyMonitoring]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pregnancy monitoring record deleted successfully
 */
router.delete("/:id", deletePregnancy_monitoring)

export default router
