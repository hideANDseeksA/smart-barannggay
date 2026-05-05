import express from "express";
import {
  createDocuments,
  getDocuments,
  updateDocuments,
  deleteDocuments,
  getResidentDocuments
} from "../controllers/document.controller";

import { encryptFields } from "../middleware/encrypt.middleware";
import { decryptFields } from "../middleware/decrypt.middleware";
import { upload } from "../middleware/upload";

const router = express.Router();
const SENSITIVE_FIELDS = ["title", "purpose"];


router.post("/", upload.single("file"), encryptFields(SENSITIVE_FIELDS), createDocuments);


router.get("/", decryptFields(SENSITIVE_FIELDS), getDocuments);

router.get("/resident", decryptFields(SENSITIVE_FIELDS), getResidentDocuments);


router.put("/:id", upload.single("file"), encryptFields(SENSITIVE_FIELDS), updateDocuments);


router.delete("/:id", deleteDocuments);

export default router;
