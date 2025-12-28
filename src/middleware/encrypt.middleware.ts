// src/middleware/encrypt.middleware.ts
import { Request, Response, NextFunction } from "express";
import { encrypt } from "../utils/crypto.util";

export const encryptFields =
  (fields: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.body) return next();

    fields.forEach((field) => {
      if (req.body[field] && typeof req.body[field] === "string") {
        req.body[field] = encrypt(req.body[field]);
      }
    });

    next();
  };
