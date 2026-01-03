import { Request, Response } from "express"
import prisma from "../prisma"
import { handlePrismaError } from "../helper/prisma.helper"

/* CREATE */
export const createResident = async (req: Request, res: Response): Promise<void> => {
  try {
    const resident = await prisma.residents.create({
      data: req.body,
    })
    res.status(201).json(resident)
  } catch (err) {
     handlePrismaError(err, res)
  }
}

/* READ ALL */
export const getResidents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const residents = await prisma.residents.findMany()
    res.json(residents)
  } catch (err) {
  handlePrismaError(err, res)
  }
}

/* READ ONE */
export const getResidentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const resident = await prisma.residents.findUnique({
      where: { id: req.params.id },
    })

    if (!resident) {
      res.status(404).json({ message: "Resident not found" })
      return
    }

    res.json(resident)
  } catch (err) {
 handlePrismaError(err, res)
  }
}

/* UPDATE */
export const updateResident = async (req: Request, res: Response): Promise<void> => {
  try {
    const resident = await prisma.residents.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(resident)
  } catch (err) {
 handlePrismaError(err, res)
  }
}

/* DELETE */
export const deleteResident = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.residents.delete({
      where: { id: req.params.id },
    })
    res.json({ message: "Resident deleted successfully" })
  } catch (err) {
   handlePrismaError(err, res)
  }
}
