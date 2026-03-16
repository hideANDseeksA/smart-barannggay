import express from "express";
import {
  createCertificates,
  getCertificates,
  updateCertificates,
  deleteCertificates,
  getResidentCertificates,
} from "../controllers/certificates.controller";
import { getCertificateForm } from "../controllers/certficate_generator_form.controller";
import { encryptFields } from "../middleware/encrypt.middleware";
import { decryptFields } from "../middleware/decrypt.middleware";
import { upload } from "../middleware/upload"
import { rbac } from "../middleware/rbac";
import { authenticate } from "../middleware/auth.middleware";
const router = express.Router();
const SENSITIVE_FIELDS = ["template_name","template_requirements"];



router.post(
  "/",
  upload.single("template"),        
  encryptFields(SENSITIVE_FIELDS),  
    authenticate,
  rbac("admin", "staff", "resident"),
  createCertificates            
)


router.get(
  "/:id/form",
  decryptFields(SENSITIVE_FIELDS),
  getCertificateForm
)



router.get("/", decryptFields(SENSITIVE_FIELDS), 
  authenticate,
  rbac("admin", "staff", "resident"),
  getCertificates);



router.get("/resident", decryptFields(SENSITIVE_FIELDS), getResidentCertificates);



router.put(
  "/:id",
  upload.single("template"),          
  encryptFields(SENSITIVE_FIELDS),
  authenticate,
  rbac("admin", "staff", "resident"),   
  updateCertificates                
)



router.delete("/:id",
    authenticate,
  rbac("admin", "staff"),
   deleteCertificates);

export default router;
