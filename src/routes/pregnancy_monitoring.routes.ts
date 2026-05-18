import express from "express"
import {
  createPregnancy_monitoring,
  getPregnancy_monitoring,
  getPregnancy_monitoringById,
  updatePregnancy_monitoring,
  deletePregnancy_monitoring,
  getMissedVisits,
  patchPregnancyMonitoringStatus
    } from "../controllers/pregnancy_monitoring.controller"
import { decryptFields } from "../middleware/decrypt.middleware"
import { encryptFields } from "../middleware/encrypt.middleware"

const router = express.Router()
const SENSITIVE_FIELDS =["details"]

router.post("/", encryptFields(SENSITIVE_FIELDS), createPregnancy_monitoring)

router.get("/", decryptFields(SENSITIVE_FIELDS), getPregnancy_monitoring)

router.get("/missed", decryptFields(SENSITIVE_FIELDS),   getMissedVisits)

router.get("/:id", decryptFields(SENSITIVE_FIELDS), getPregnancy_monitoringById)


router.put("/:id", encryptFields(SENSITIVE_FIELDS), updatePregnancy_monitoring)


router.delete("/:id", deletePregnancy_monitoring)

router.patch("/:id/status", patchPregnancyMonitoringStatus)
export default router
