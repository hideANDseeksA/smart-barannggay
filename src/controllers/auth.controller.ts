import { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import {
  signAccessToken,
  signRefreshToken,
} from "../utils/jwt.util";
import { hashEmail } from "../utils/hash.util";
import { decryptAll } from "../utils/crypto.util";
import { verifyGoogleToken } from "../utils/googleAuth.util";

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body; // Google ID token from frontend

    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const payload = await verifyGoogleToken(token);

    if (!payload?.email) {
      res.status(401).json({ error: "Invalid Google token" });
      return;
    }


       const hashedEmail = hashEmail(payload.email.toLowerCase());
    // 🔹 Find resident by email
    const resident = await prisma.residents.findUnique({
      where: { h_email_address: hashedEmail },
    });

    if (!resident) {
      res.status(403).json({ error: "Resident not registered" });
      return;
    }

    // 🔹 Find or create user
    let user = await prisma.user.findUnique({
      where: { resident_id: resident.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          resident_id: resident.id,
          verified: true,
          // store Google sub as reference
          // google_id: payload.sub // optional
        },
      });
    }

    // 🔹 Prepare JWT payload
    const jwtPayload = {
      id: user.id,
      role: user.role,
      resident_id: user.resident_id,
      data: {
        resident_name: decryptAll(resident.f_name) + " " + decryptAll(resident.l_name),
        resident_email: payload.email.toLowerCase(),
        resident_sex: resident.sex,
      },
    };

    // 🔹 Sign tokens
    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    // 🔐 Send refresh token as HttpOnly cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIES === "true",
      sameSite: "lax",
      path: "/api",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 
    });

    // ✅ Send access token in JSON
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google login failed" });
  }
};

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
      secure: process.env.COOKIES === "true",
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
