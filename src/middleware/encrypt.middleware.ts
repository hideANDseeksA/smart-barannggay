// src/middleware/encrypt.middleware.ts
import { Request, Response, NextFunction } from "express"
import { encrypt } from "../utils/crypto.util"

export const encryptFields =
  (fields: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.body) return next()

    // ✅ CASE 1: ARRAY BODY (bulk)
    if (Array.isArray(req.body)) {
      req.body = req.body.map((item) => {
        const copy = { ...item }

        fields.forEach((field) => {
          if (copy[field] !== undefined && copy[field] !== null) {
            const value =
              typeof copy[field] === "object"
                ? JSON.stringify(copy[field])
                : String(copy[field])

            copy[field] = encrypt(value)
          }
        })

        return copy
      })

      return next()
    }

    // ✅ CASE 2: OBJECT BODY (create / update)
    const copy = { ...req.body }

    fields.forEach((field) => {
      if (copy[field] !== undefined && copy[field] !== null) {
        const value =
          typeof copy[field] === "object"
            ? JSON.stringify(copy[field])
            : String(copy[field])

        copy[field] = encrypt(value)
      }
    })

    req.body = copy
    next()
  }
