import { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import {
  signAccessToken,
  signRefreshToken,
} from "../utils/jwt.util";
import { safeDecrypt } from "../utils/crypto.util";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resident_id, password } = req.body;

    const resident = await prisma.residents.findUnique({
      where: { resident_id },
    });

    if (!resident) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { resident_id: resident.id },
    });

    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!user.verified) {
      res.status(403).json({ error: "Account not verified" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // ✅ TWO TOKENS, TWO PURPOSES
    const payload = {
      id: user.id,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // 🔐 Refresh token ONLY in HttpOnly cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      path: "/api",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Access token returned in JSON
    res.json({
      accessToken,
      user: {
        id: user.id,
        resident_id: user.resident_id,
        role: user.role,
        resident: {
          fName: safeDecrypt(resident.f_name),
          lName: safeDecrypt(resident.l_name),
          mName: safeDecrypt(resident.m_name),
          email: safeDecrypt(resident.email_address),
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};
