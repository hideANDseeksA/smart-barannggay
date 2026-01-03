import { Request, Response } from "express"
import prisma from "../prisma"

/* CREATE */
export const createHealth_record = async (req: Request, res: Response): Promise<void> => {
  try {
    const health_record = await prisma.health_records.create({
      data: req.body,
    })
    res.status(201).json(health_record)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* READ ALL */
export const getHealth_records = async (_req: Request, res: Response): Promise<void> => {
  try {
    const health_records = await prisma.health_records.findMany()
    res.json(health_records)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* READ ONE */
export const getHealth_recordById = async (req: Request, res: Response): Promise<void> => {
  try {
    const health_record = await prisma.health_records.findMany({
      where: { resident_id: req.params.id },
    })

    if (!health_record) {
      res.status(404).json({ message: "health_record not found" })
      return
    }

    res.json(health_record)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* UPDATE */
export const updateHealth_record = async (req: Request, res: Response): Promise<void> => {
  try {
    const health_record = await prisma.health_records.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(health_record)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* DELETE */
export const deleteHealth_record = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.health_records.delete({
      where: { id: req.params.id },
    })
    res.json({ message: "health_record deleted successfully" })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}
