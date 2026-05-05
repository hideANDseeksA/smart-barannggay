import express from "express"
import {
  upsertsystem_setting,
  getsystem_setting,
  deletesystem_setting,
} from "../controllers/system_setting.controller"

import { encryptFields } from "../middleware/encrypt.middleware"
import { decryptFields } from "../middleware/decrypt.middleware"
import { upload } from "../middleware/upload"

const router = express.Router()

const SENSITIVE_FIELDS = ["web_name", "web_color", "barangay_status"]


router.post(
  "/",
  upload.single("logo"),
  encryptFields(SENSITIVE_FIELDS),
  upsertsystem_setting
)


router.get("/", decryptFields(SENSITIVE_FIELDS), getsystem_setting)


router.delete("/", deletesystem_setting)

export default router
