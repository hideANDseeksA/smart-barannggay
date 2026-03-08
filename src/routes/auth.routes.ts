import express from "express";
import { login,googleLogin } from "../controllers/auth.controller";
import { refreshAccessToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/login", login);

router.post("/google-login",googleLogin)

// 🔁 Refresh access token (cookie only)
router.post("/refresh", refreshAccessToken);

// 🚪 Logout
router.post("/logout", (req, res) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: false, // true in production
    sameSite: "lax",
    path: "/api", // must match cookie path
  });
  res.sendStatus(204);
});

export default router;
