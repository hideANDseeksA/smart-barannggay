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
import axios from "axios";
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body; // access_token from useGoogleLogin

    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    // Get Google user info using the access token
    const googleResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const payload = googleResponse.data;

    if (!payload?.email) {
      res.status(401).json({ error: "Invalid Google token" });
      return;
    }

    const email = String(payload.email).toLowerCase();
    const hashedEmail = hashEmail(email);

    // Find resident by hashed email
    const resident = await prisma.residents.findUnique({
      where: { h_email_address: hashedEmail },
    });

    if (!resident) {
      res.status(403).json({ error: "Resident not registered" });
      return;
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { resident_id: resident.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          resident_id: resident.id,
          verified: true,
          // optional:
          // google_id: payload.sub,
          // auth_provider: "google",
        },
      });
    }

    const firstName = decryptAll(resident.f_name);
    const lastName = decryptAll(resident.l_name);

    const jwtPayload = {
      id: user.id,
      role: user.role,
      resident_id: user.resident_id,
      data: {
        resident_name: `${firstName} ${lastName}`,
        resident_email: email,
        resident_sex: resident.sex,
      },
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIES === "true",
      sameSite: "lax",
      path: "/api",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken });
  } catch (err: any) {
    console.error("Google login failed:", err.response?.data || err.message || err);
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
