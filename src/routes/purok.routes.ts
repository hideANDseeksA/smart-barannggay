import express from "express"
import {
  createPurok,
  getPurok,
  updatePurok,
  deletePurok,
} from "../controllers/purok.controller"
import { encryptFields } from "../middleware/encrypt.middleware";
import { decryptFields } from "../middleware/decrypt.middleware";
const router = express.Router()

router.post("/",createPurok)

router.get("/", getPurok)


router.put("/:id", updatePurok)


router.delete("/:id", deletePurok)

export default router
