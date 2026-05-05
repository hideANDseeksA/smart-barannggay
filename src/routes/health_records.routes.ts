import express from "express"
import {
    createHealth_record,
    getHealth_records,
    getHealth_recordById,
    getHealth_recordsByResidentId,
    updateHealth_record,
    deleteHealth_record,
} from "../controllers/health_records.controller"
import { encryptFields } from "../middleware/encrypt.middleware"
import { decryptFields } from "../middleware/decrypt.middleware"

const router = express.Router()
const SENSITIVE_FIELDS = ["details"];

router.post("/", encryptFields(SENSITIVE_FIELDS), createHealth_record)


router.get("/", decryptFields(SENSITIVE_FIELDS), getHealth_records)


router.get("/:record_id", decryptFields(SENSITIVE_FIELDS), getHealth_recordById)


router.get("/pregnant/:record_id", decryptFields(SENSITIVE_FIELDS), getHealth_recordsByResidentId)


router.put("/:id", encryptFields(SENSITIVE_FIELDS), updateHealth_record)


router.delete("/:id", deleteHealth_record)

export default router
