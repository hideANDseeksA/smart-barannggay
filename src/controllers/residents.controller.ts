import { Request, Response } from "express"
import prisma from "../prisma"
import { handlePrismaError } from "../helper/prisma.helper"
import { decryptAll } from "../utils/crypto.util"
import { calculateAge } from "../helper/agecalculator.helper"
import { Prisma } from "@prisma/client"
/* CREATE */
export const createResident = async (
  req: Request<{}, {}, Prisma.residentsCreateInput>,
  res: Response
): Promise<void> => {
  try {
    // Convert b_date to full ISO string if present
    const data = {
      ...req.body,
      b_date: req.body.b_date ? new Date(req.body.b_date).toISOString() : null,
    };

    // Prisma middleware will auto-generate resident_id
    const resident = await prisma.residents.create({
      data,
    });

    res.status(201).json(resident);
  } catch (err) {
    handlePrismaError(err, res);
  }
};
/* READ ALL */
export const getResidents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.max(Number(req.query.limit) || 50, 1)

    const skip = (page - 1) * limit

    const [residents, total] = await Promise.all([
      prisma.residents.findMany({
        skip,
        take: limit,
        include : {
          purok: {
            select: {
              name: true
            }
          },
      }}),
      prisma.residents.count(),
    ])

    const decryptedResidents = decryptAll(residents)

    const residentsWithAge = decryptedResidents.map((resident: any) => ({
      ...resident,
      age: calculateAge(resident.b_date),
    }))

    res.json({
      residents: residentsWithAge,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
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
