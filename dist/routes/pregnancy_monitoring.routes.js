"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pregnancy_monitoring_controller_1 = require("../controllers/pregnancy_monitoring.controller");
const decrypt_middleware_1 = require("../middleware/decrypt.middleware");
const encrypt_middleware_1 = require("../middleware/encrypt.middleware");
const router = express_1.default.Router();
const SENSITIVE_FIELDS = ["complications", "checkup_notes"];
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
router.post("/", (0, encrypt_middleware_1.encryptFields)(SENSITIVE_FIELDS), pregnancy_monitoring_controller_1.createPregnancy_monitoring);
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
router.get("/", (0, decrypt_middleware_1.decryptFields)(SENSITIVE_FIELDS), pregnancy_monitoring_controller_1.getPregnancy_monitoring);
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
router.get("/:id", (0, decrypt_middleware_1.decryptFields)(SENSITIVE_FIELDS), pregnancy_monitoring_controller_1.getPregnancy_monitoringById);
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
router.put("/:id", (0, encrypt_middleware_1.encryptFields)(SENSITIVE_FIELDS), pregnancy_monitoring_controller_1.updatePregnancy_monitoring);
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
router.delete("/:id", pregnancy_monitoring_controller_1.deletePregnancy_monitoring);
exports.default = router;
