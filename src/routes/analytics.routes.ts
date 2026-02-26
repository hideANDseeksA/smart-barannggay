    

import express from "express";
import {  getWebsite, getWebsiteActive, getWebsiteStats, } from "../controllers/analytics.controller";
const router = express.Router();


router.get("/website",                  getWebsite);
router.get("/website/active",    getWebsiteActive);
router.get("/website/stats",     getWebsiteStats);


export default router;