import express from "express";
import {
  createCertificates,
  getCertificates,
  updateCertificates,
  deleteCertificates,
} from "../controllers/certificates.controller";
import { getCertificateForm } from "../controllers/certficate_generator_form.controller";
import { encryptFields } from "../middleware/encrypt.middleware";
import { decryptFields } from "../middleware/decrypt.middleware";
import { upload } from "../middleware/upload"
import { rbac } from "../middleware/rbac";
import { authenticate } from "../middleware/auth.middleware";
const router = express.Router();
const SENSITIVE_FIELDS = ["template_name","template_requirements"];

/**
 * @swagger
 * tags:
 *   name: certificates
 *   description: Barangay certificates management
 */

/**
 * @swagger
 * /api/certificates:
 *   post:
 *     summary: Create a new Certificate Template
 *     tags: [certificates]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - template_name
 *               - template
 *             properties:
 *               template_name:
 *                 type: string
 *                 description: Name of the certificate template
 *               template_price:
 *                 type: number
 *                 description: Price of the certificate
 *               requestType:
 *                 type: boolean
 *                 description: Request type flag
 *               template:
 *                 type: string
 *                 format: binary
 *                 description: Certificate template file (PDF/DOCX)
 *     responses:
 *       201:
 *         description: Certificate created successfully
 */


router.post(
  "/",
  upload.single("template"),        // 1️⃣ parse file
  encryptFields(SENSITIVE_FIELDS),  // 2️⃣ encrypt body fields
  createCertificates            
)


/**
 * @swagger
 * /api/certificates/{id}/form:
 *   get:
 *     summary: Get dynamic form fields for a certificate template
 *     description: >
 *       Extracts placeholders from a DOCX certificate template stored in Supabase
 *       and returns a dynamic form schema.
 *     tags:
 *       - Certificates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Dynamic form fields retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 certificate_id:
 *                   type: string
 *                   format: uuid
 *                 fields:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: full_name
 *                       label:
 *                         type: string
 *                         example: Full Name
 *                       type:
 *                         type: string
 *                         example: text
 *                       required:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Bad request (template missing or signed URL failure)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Template not found
 *       404:
 *         description: Certificate not found
 *       500:
 *         description: Internal server error
 */

router.get(
  "/:id/form",
  decryptFields(SENSITIVE_FIELDS),
  getCertificateForm
)


/**
 * @swagger
 * /api/certificates:
 *   get:
 *     summary: Get all Certificates
 *     tags: [certificates]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of Certificates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the certificate
 *                   template_name:
 *                     type: string
 *                     description: Name of the certificate template
 *                   template_price:
 *                     type: number
 *                     description: Price of the certificate template
 *                   template_path:
 *                     type: string
 *                     description: Path to the certificate template file
 *                   template_url:
 *                     type: string
 *                     description: Signed URL to access the certificate template file
 */

router.get("/", decryptFields(SENSITIVE_FIELDS), 
  authenticate,
  rbac("admin", "staff", "resident"),
  getCertificates);


/**
 * @swagger
 * /api/certificates/{id}:
 *   put:
 *     summary: Update a Certificate
 *     tags: [certificates]
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
 *               template_name:
 *                 type: string
 *                 description: Name of the certificate template
 *               template_price:
 *                 type: number
 *                 description: Price of the certificate template
 *               requestType:
 *                 type: boolean
 *                 description: Request type flag
 *               template:
 *                 type: string
 *                 format: binary
 *                 description: Certificate template file (PDF/DOCX)
 *     responses:
 *       200:
 *         description: Certificate updated successfully
 */
router.put(
  "/:id",
  upload.single("template"),          // 1️⃣ handle file upload
  encryptFields(SENSITIVE_FIELDS),    // 2️⃣ encrypt body fields
  updateCertificates                  // 3️⃣ update DB + replace file
)

/**
 * @swagger
 * /api/certificates/{id}:
 *   delete:
 *     summary: Delete a Certificate
 *     tags: [certificates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate deleted successfully
 */
router.delete("/:id", deleteCertificates);

export default router;
