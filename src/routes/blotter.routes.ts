import express from "express";
import {
  createBlotter,
  getbBlotter,
  searchBlotters,
  getBlotterById,
  updateBlotter,
  deleteBlotter,
  getBlotterReport

} from "../controllers/blotter.controller";
import { encryptFields } from "../middleware/encrypt.middleware";
import { decryptFields } from "../middleware/decrypt.middleware";
import { upload } from "../middleware/upload"
import { rbac } from "../middleware/rbac";
import { authenticate } from "../middleware/auth.middleware";
const router = express.Router();
const SENSITIVE_FIELDS = ["details"];


router.post(
  "/",
  upload.single("file"),       
  encryptFields(SENSITIVE_FIELDS),  
  createBlotter          
)



router.get(
    "/",
    decryptFields(SENSITIVE_FIELDS),
    getbBlotter


)


router.get(
  "/report",
  getBlotterReport
)
router.get(
  "/:id",
  decryptFields(SENSITIVE_FIELDS),
  getBlotterById
)


router.put(
    "/:id",
    upload.single("file"),
    encryptFields(SENSITIVE_FIELDS),
    updateBlotter
)


router.delete(
    "/:id",
    deleteBlotter
)
router.post("/search",decryptFields(SENSITIVE_FIELDS), searchBlotters);


export default router;
