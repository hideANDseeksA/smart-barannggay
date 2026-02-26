// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 🔹 Support all roles your app uses
type Role = "admin" | "staff" | "resident" | "healthworker";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}

/**
 * Middleware to protect routes with Access Token (Bearer)
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as AuthRequest["user"];
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Access token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Route handler to refresh Access Token using HttpOnly refresh cookie
 */
export const refreshAccessToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token missing" });
  }

  try {
    // ✅ Decode full refresh payload
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as any;

    // ❗ Remove JWT internal fields before re-signing
    const { iat, exp, ...cleanPayload } = payload;

    const newAccessToken = jwt.sign(
      cleanPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token verification failed:", err);
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};