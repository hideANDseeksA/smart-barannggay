import express from "express";
import { login,googleLogin,signup,verifyEmail,resendVerificationEmail,forgotPassword,resetPassword,googleSignup,sendVerificationEmail  } from "../controllers/auth.controller";
import { refreshAccessToken } from "../middleware/auth.middleware";


const router = express.Router();

router.post("/login", login);

router.post("/google-login",googleLogin)


router.post("/signup", signup);

router.post("/google-signup",googleSignup)

router.post("/verify-email", verifyEmail);

router.post("/forgot-password",forgotPassword);

router.post("/reset-password",resetPassword)

router.post("/send-verification",sendVerificationEmail)


router.post("/resend-verification-email", resendVerificationEmail);
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
