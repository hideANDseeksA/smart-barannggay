// middleware/rate-limit.ts

import rateLimit from "express-rate-limit";
import { Request } from "express";
import { error } from "console";

const getClientIP = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }

  return req.socket.remoteAddress || req.ip || "0.0.0.0";
};

/**
 * Reusable rate limiter factory
 */
export const createRateLimiter = (
  windowMinutes: number,
  maxRequests: number
) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,

    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => getClientIP(req),

    message: {
      error: "Too many requests. Please try again later.",
    },
  });
};