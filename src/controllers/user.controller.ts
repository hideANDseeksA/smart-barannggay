import { Request, Response } from "express"
import prisma from "../prisma"
import {hashData} from "../utils/hash.util";

/**
 * Create user (Admin only)
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resident_id, password, role } = req.body

    const resident = await prisma.residents.findUnique({
      where: { resident_id: resident_id },
    })

    if (!resident) {
      res.status(404).json({ error: "Resident not found" })
      return
    }

    if (!resident_id || !password) {
      res.status(400).json({ error: "resident_id and password are required" })
      return
    }

    // Hash password
    const hashedPassword = await hashData(password)

    const user = await prisma.user.create({
      data: {
        resident_id:resident.id,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        resident_id: true,
        role: true,
        verified: true,
      }, // ❌ never return password
    })

    res.status(201).json(user)
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
            f_name: true,
            l_name: true,
          },
        },
      },
    })

    res.status(200).json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}


