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


router.post(
    "/",
    upload.single("file"),
    encryptFields(SENSITIVE_FIELDS),
    createComplaints
);


router.get("/", decryptFields(SENSITIVE_FIELDS), getcomplaints);

router.put(
    "/:id",
    upload.single("file"),
    encryptFields(SENSITIVE_FIELDS),
    updatecomplaints
);

router.delete("/:id",  deletecomplaints);

export default router;
