import { Request, Response } from "express"
import prisma from "../prisma"
import bcrypt from "bcryptjs"
import { signToken } from "../utils/jwt.util" // adjust path if needed

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resident_id, password } = req.body

    const resident = await prisma.residents.findUnique({
      where: { resident_id },
    })

    if (!resident) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    const user = await prisma.user.findUnique({
      where: { resident_id: resident?.id},
    })

    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    if (!user.verified) {
      res.status(403).json({ error: "Account not verified" })
      return
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    const token = signToken({
      id: user.id,
      role: user.role,
    })

    res.json({
      token,
      user: {
        id: user.id,
        resident_id: user.resident_id,
        role: user.role,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Login failed" })
  }
}

