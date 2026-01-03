import express from "express";
import {
    createHealthAppointment,
    getHealthAppointments,
    getHealthAppointmentById,
    updateHealthAppointment,
    deleteHealthAppointment,
} from "../controllers/health_appointments.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health Appointments
 *   description: Barangay health appointments management
 */

/**
 * @swagger
 * /api/health_appointments:
 *   post:
 *     summary: Create a new health appointment
 *     tags: [Health Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resident_id
 *               - blood_pressure
 *               - appointment_date
 *             properties:
 *               resident_id:
 *                 type: string
 *               blood_pressure:
 *                 type: string
 *               appointment_date:
 *                 type: string
 *                 format: date-time
 *               purpose:
 *                 type: string
 *               status:
 *                 type: string
 *                 default: pending
 *     responses:
 *       201:
 *         description: Health appointment created successfully
 */
router.post("/", createHealthAppointment);

/**
 * @swagger
 * /api/health_appointments:
 *   get:
 *     summary: Get all health appointments
 *     tags: [Health Appointments]
 *     responses:
 *       200:
 *         description: List of health appointments
 */
router.get("/", getHealthAppointments);

/**
 * @swagger
 * /api/health_appointments/{id}:
 *   get:
 *     summary: Get health appointment by ID
 *     tags: [Health Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health appointment found
 *       404:
 *         description: Health appointment not found
 */
router.get("/:id", getHealthAppointmentById);

/**
 * @swagger
 * /api/health_appointments/{id}:
 *   put:
 *     summary: Update health appointment
 *     tags: [Health Appointments]
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
 *               blood_pressure:
 *                 type: string
 *               appointment_date:
 *                 type: string
 *                 format: date-time
 *               purpose:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Health appointment updated
 */
router.put("/:id", updateHealthAppointment);

/**
 * @swagger
 * /api/health_appointments/{id}:
 *   delete:
 *     summary: Delete health appointment
 *     tags: [Health Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Health appointment deleted
 */
router.delete("/:id", deleteHealthAppointment);

export default router;
