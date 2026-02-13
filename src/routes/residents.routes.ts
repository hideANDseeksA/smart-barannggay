import express from "express"
import {
  createResident,
  getResidents,
  getResidentById,
  updateResident,
  deleteResident,
  createResidentsFromCSV
} from "../controllers/residents.controller"
import { encryptFields } from "../middleware/encrypt.middleware"
import { decryptFields } from "../middleware/decrypt.middleware";
import { upload_csv } from "../middleware/upload"
const router = express.Router()
const SENSITIVE_FIELDS = ["f_name", "m_name", "l_name", "s_name","b_place","house_no", "email_address", "contact_no","purok"];
/**
 * @swagger
 * tags:
 *   name: Residents
 *   description: Barangay residents management
 */

/**
 * @swagger
 * /api/residents/import-csv:
 *   post:
 *     summary: Import residents from a CSV file
 *     tags: [Residents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Residents imported successfully
 *       400:
 *         description: CSV file missing or invalid
 */
router.post(
  "/import-csv",
  upload_csv.single("file"),                // multer middleware for CSV upload
  encryptFields(SENSITIVE_FIELDS),      // encrypt sensitive fields
  createResidentsFromCSV                // controller
);

/**
 * @swagger
 * /api/residents:
 *   post:
 *     summary: Create a new resident
 *     tags: [Residents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - f_name
 *             properties:
 *               id:
 *                 type: string
 *               f_name:
 *                 type: string
 *               m_name:
 *                 type: string
 *               l_name:
 *                 type: string
 *               contact_no:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resident created successfully
 */
router.post("/",  
encryptFields(SENSITIVE_FIELDS),
createResident)

/**
 * @swagger
 * /api/residents:
 *   get:
 *     summary: Get all residents
 *     tags: [Residents]
 *     responses:
 *       200:
 *         description: List of residents
 */
router.get("/", decryptFields(SENSITIVE_FIELDS), getResidents)

/**
 * @swagger
 * /api/residents/{id}:
 *   get:
 *     summary: Get resident by ID
 *     tags: [Residents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resident found
 *       404:
 *         description: Resident not found
 */
router.get("/:id", decryptFields(SENSITIVE_FIELDS), getResidentById)

/**
 * @swagger
 * /api/residents/{id}:
 *   put:
 *     summary: Update resident
 *     tags: [Residents]
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
 *             required:
 *               - resident_id
 *               - f_name
 *               - l_name
 *               - contact_no
 *             properties:
 *               resident_id:
 *                 type: string
 *               f_name:
 *                 type: string
 *               m_name:
 *                 type: string
 *               l_name:
 *                 type: string
 *               s_name:
 *                 type: string
 *                 nullable: true
 *               purok:
 *                 type: string
 *                 nullable: true
 *               house_no:
 *                 type: string
 *                 nullable: true
 *               sex:
 *                 type: string
 *                 nullable: true
 *               b_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               b_place:
 *                 type: string
 *                 nullable: true
 *               voting_status:
 *                 type: boolean
 *               sector:
 *                 type: string
 *               remarks:
 *                 type: string
 *                 nullable: true
 *               email_address:
 *                 type: string
 *                 nullable: true
 *               contact_no:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resident updated
 */

router.put("/:id", encryptFields(SENSITIVE_FIELDS), updateResident)

/**
 * @swagger
 * /api/residents/{id}:
 *   delete:
 *     summary: Delete resident
 *     tags: [Residents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resident deleted
 */
router.delete("/:id", deleteResident)

export default router
