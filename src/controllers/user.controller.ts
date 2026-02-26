import { Request, Response } from "express"
import prisma from "../prisma"
import {hashEmail,hashPassword} from "../utils/hash.util";
import { decryptAll } from "../utils/crypto.util"
/**
 * Create user (Admin only)
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email_address, password ,role } = req.body

    const hashedEmail = hashEmail(email_address)

    const resident = await prisma.residents.findUnique({
      where: { h_email_address: hashedEmail },
    })

    if (!resident) {
      res.status(404).json({ error: "Resident not found" })
      return
    }

    if (!email_address || !password) {
      res.status(400).json({ error: "email_address and password are required" })
      return
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

     await prisma.user.create({
      data: {
        resident_id:resident.id,
        password: hashedPassword,
        role: role || "resident",
      },
      select: {
        id: true,
        resident_id: true,
        role: true,
        verified: true,
      }, 
    })

    res.status(201).json("User created successfully")
  } catch (err: any) {
    console.error(err)

    if (err.code === "P2002") {
      res.status(409).json({ error: "User already exists" })
      return
    }

    res.status(500).json({ error: "Internal server error" })
  }
}

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        resident_id: true,
        role: true,
        verified: true,
        resident: {
          select: {
            id: true,
            resident_id: true,
            f_name: true,
            l_name: true,
            email_address: true,
          },
        },
      },
    })

    res.status(200).json(decryptAll(users))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}


