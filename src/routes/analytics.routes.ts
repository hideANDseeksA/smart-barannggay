    

import express from "express";
import {  getWebsite, getWebsiteActive, getWebsiteStats,getDashboardStats,getDashboardTotals } from "../controllers/analytics.controller";
import { verifyApiKey } from "../middleware/apiKey.middleware";

const router = express.Router();

// router.use(verifyApiKey);

router.get("/website",                  getWebsite);
router.get("/website/active",    getWebsiteActive);
router.get("/website/stats",     getWebsiteStats);
router.get("/dashboard/stats",   getDashboardStats);
router.get("/dashboard/totals",  getDashboardTotals);


export default router;