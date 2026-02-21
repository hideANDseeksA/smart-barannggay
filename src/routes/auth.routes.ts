import express from "express";
import { login } from "../controllers/auth.controller";
import { refreshAccessToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/login", login);

// 🔁 Refresh access token (cookie only)
router.post("/refresh", refreshAccessToken);

// 🚪 Logout
router.post("/logout", (req, res) => {
  res.clearCookie("refresh_token", {
    path: "/api/auth/refresh",
  });
  res.sendStatus(204);
});

export default router;
