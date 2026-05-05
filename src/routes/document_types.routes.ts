import express from "express";
import {
  createDocument_types,
  getDocument_types,
  updateDocument_types,
  deleteDocument_types,
} from "../controllers/document_types.controller";

import { encryptFields } from "../middleware/encrypt.middleware";
import { decryptFields } from "../middleware/decrypt.middleware";
const router = express.Router();
const SENSITIVE_FIELDS = ["name", "description"];


router.post("/", encryptFields(SENSITIVE_FIELDS), createDocument_types);

router.get("/", decryptFields(SENSITIVE_FIELDS), getDocument_types);


router.put("/:id", encryptFields(SENSITIVE_FIELDS), updateDocument_types);


router.delete("/:id", deleteDocument_types);

export default router;
