import express from "express"
import {
  createResident,
  getResidents,
  getResidentById,
  updateResident,
  deleteResident,
} from "../controllers/residents.controller"
import { encryptFields } from "../middleware/encrypt.middleware"
import { decryptFields } from "../middleware/decrypt.middleware";
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
router.get("/:id", getResidentById)

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
