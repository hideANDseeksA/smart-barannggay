"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const health_records_controller_1 = require("../controllers/health_records.controller");
const encrypt_middleware_1 = require("../middleware/encrypt.middleware");
const decrypt_middleware_1 = require("../middleware/decrypt.middleware");
const router = express_1.default.Router();
const SENSITIVE_FIELDS = ["blood_type", "allergies", "chronic_conditions"];
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
router.post("/", (0, encrypt_middleware_1.encryptFields)(SENSITIVE_FIELDS), health_records_controller_1.createHealth_record);
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
router.get("/", (0, decrypt_middleware_1.decryptFields)(SENSITIVE_FIELDS), health_records_controller_1.getHealth_records);
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
router.get("/:id", (0, decrypt_middleware_1.decryptFields)(SENSITIVE_FIELDS), health_records_controller_1.getHealth_recordById);
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
router.put("/:id", (0, encrypt_middleware_1.encryptFields)(SENSITIVE_FIELDS), health_records_controller_1.updateHealth_record);
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
router.delete("/:id", health_records_controller_1.deleteHealth_record);
exports.default = router;
