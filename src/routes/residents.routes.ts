import express from "express"
import {
  createResident,
  getResidents,
  getBDACResidents,
  getArchiveResidents,
  getResidentsByID,
  updateResident,
  deleteResident,

} from "../controllers/residents.controller"
import { encryptFields } from "../middleware/encrypt.middleware"
import { decryptFields } from "../middleware/decrypt.middleware"
import { upload_csv } from "../middleware/upload"
import { validate } from "../middleware/validate.middleware"
import {
  residentSchema,
  residentUpdateSchema,
} from "../validators/resident.validator"


const router = express.Router()

const SENSITIVE_FIELDS = [
  "f_name",
  "m_name",
  "l_name",
  "s_name",
  "b_place",
  "house_no",
  "email_address",
  "contact_no",
  "purok"
]



router.post("/",   validate(residentUpdateSchema),encryptFields(SENSITIVE_FIELDS), createResident)

router.get("/", decryptFields(SENSITIVE_FIELDS), getResidents)

router.get("/bdac", decryptFields(SENSITIVE_FIELDS), getBDACResidents)

router.get("/archive", decryptFields(SENSITIVE_FIELDS), getArchiveResidents)

router.get("/:id", decryptFields(SENSITIVE_FIELDS), getResidentsByID)

router.put("/:id",  validate(residentUpdateSchema), encryptFields(SENSITIVE_FIELDS), updateResident)

router.delete("/:id", deleteResident)

export default router