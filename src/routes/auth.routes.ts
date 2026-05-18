import express from "express";
import { login,googleLogin,signup,verifyEmail,resendVerificationEmail,forgotPassword,resetPassword,googleSignup,sendVerificationEmail  } from "../controllers/auth.controller";
import { refreshAccessToken } from "../middleware/auth.middleware";
import { createRateLimiter } from "../middleware/rate-limit";

const router = express.Router();



const authRateLimiter = createRateLimiter(15, 10); // 15 minutes, max 10 requests

router.post("/login",authRateLimiter, login);

router.post("/google-login",authRateLimiter,googleLogin)


router.post("/signup", authRateLimiter, signup);

router.post("/google-signup",authRateLimiter,googleSignup)

router.post("/verify-email", verifyEmail);

router.post("/forgot-password",authRateLimiter,forgotPassword);

router.post("/reset-password",authRateLimiter,resetPassword)

router.post("/send-verification",authRateLimiter,sendVerificationEmail)


router.post("/resend-verification-email", authRateLimiter, resendVerificationEmail);
// 🔁 Refresh access token (cookie only)
router.post("/refresh", refreshAccessToken);

// 🚪 Logout
router.post("/logout", (req, res) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: false, // true in production
    sameSite: "strict",
    path: "/api", // must match cookie path
  });
  res.status(200).json({ message: "Logged out successfully" }   );
});

export default router;
