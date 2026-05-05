    

import express from "express";
import {  getWebsite, getWebsiteActive, getWebsiteStats, } from "../controllers/analytics.controller";
import { verifyApiKey } from "@/middleware/apiKey.middleware";

const router = express.Router();

router.use(verifyApiKey);

router.get("/website",                  getWebsite);
router.get("/website/active",    getWebsiteActive);
router.get("/website/stats",     getWebsiteStats);


export default router;