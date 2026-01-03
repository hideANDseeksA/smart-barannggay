import express from "express";
import {
    createComplaints,
    getcomplaints,
    updatecomplaints,
    deletecomplaints,
} from "../controllers/complaints.controller";
import { upload } from "../middleware/upload";
import { authenticate } from "../middleware/auth.middleware";
import { rbac } from "../middleware/rbac";
import { decryptFields } from "../middleware/decrypt.middleware";
import { encryptFields } from "../middleware/encrypt.middleware";

const SENSITIVE_FIELDS = ["complaint_type","description"];
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: complaints
 *   description: Barangay complaints management
 */

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [complaints]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resident_id
 *               - complaint_type
 *               - description
 *               - filed_at
 *               - status
 *               - file
 *             properties:
 *               resident_id:
 *                 type: string
 *                 description: ID of the resident filing the complaint
 *               complaint_type:
 *                 type: string
 *                 description: Type of the complaint
 *               description:
 *                 type: string
 *                 description: Description of the complaint
 *               filed_at:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time the complaint was filed
 *               status:
 *                 type: string
 *                 description: Status of the complaint
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File related to the complaint
 *     responses:
 *       201:
 *         description: Complaint created successfully
 */
router.post(
    "/",
    upload.single("file"),
    encryptFields(SENSITIVE_FIELDS),
    createComplaints
);

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [complaints]
 *     responses:
 *       200:
 *         description: List of complaints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the complaint
 *                   resident_id:
 *                     type: string
 *                     description: ID of the resident filing the complaint
 *                   complaint_type:
 *                     type: string
 *                     description: Type of the complaint
 *                   description:
 *                     type: string
 *                     description: Description of the complaint
 *                   filed_at:
 *                     type: string
 *                     format: date-time
 *                     description: Date and time the complaint was filed
 *                   status:
 *                     type: string
 *                     description: Status of the complaint
 *                   image_url:
 *                     type: string
 *                     description: Signed URL to access the complaint file
 */
router.get("/", decryptFields(SENSITIVE_FIELDS), getcomplaints);

/**
 * @swagger
 * /api/complaints/{id}:
 *   put:
 *     summary: Update a complaint
 *     tags: [complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resident_id:
 *                 type: string
 *                 description: ID of the resident filing the complaint
 *               complaint_type:
 *                 type: string
 *                 description: Type of the complaint
 *               description:
 *                 type: string
 *                 description: Description of the complaint
 *               filed_at:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time the complaint was filed
 *               status:
 *                 type: string
 *                 description: Status of the complaint
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File related to the complaint
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 */
router.put(
    "/:id",
    upload.single("file"),
    encryptFields(SENSITIVE_FIELDS),
    updatecomplaints
);

/**
 * @swagger
 * /api/complaints/{id}:
 *   delete:
 *     summary: Delete a complaint
 *     tags: [complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 */
router.delete("/:id",  deletecomplaints);

export default router;
