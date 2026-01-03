import { Request, Response } from "express"
import prisma from "../prisma"

/* CREATE */
export const createBlotter = async (req: Request, res: Response): Promise<void> => {
  try {
    const blotter = await prisma.blotter.create({
      data: req.body,
    })
    res.status(201).json(blotter)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* READ ALL */
export const getbBlotter = async (_req: Request, res: Response): Promise<void> => {
  try {
    const blotters = await prisma.blotter.findMany()
    res.json(blotters)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}



/* UPDATE */
export const updateBlotter = async (req: Request, res: Response): Promise<void> => {
  try {
    const blotter = await prisma.blotter.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(blotter)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* DELETE */
export const deleteBlotter = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.blotter.delete({
      where: { id: req.params.id },
    })
    res.json({ message: "blotter deleted successfully" })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}
