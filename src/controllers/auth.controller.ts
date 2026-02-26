import { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import {
  signAccessToken,
  signRefreshToken,
} from "../utils/jwt.util";
import { hashEmail } from "../utils/hash.util";
import { decryptAll } from "../utils/crypto.util";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email_address, password } = req.body;

    const hashedEmail = hashEmail(email_address.toLowerCase());

    const resident = await prisma.residents.findUnique({
      where: { h_email_address: hashedEmail },
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


    const payload = {
      id: user.id,
      role: user.role,
      data:{
      resident_name: decryptAll(resident.f_name) + " " + decryptAll(resident.l_name),
      resident_email: email_address.toLowerCase(),
      resident_sex: resident.sex,
      },
      resident_id: user.resident_id,
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
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};
