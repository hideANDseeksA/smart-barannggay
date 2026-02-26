import { Request, Response } from "express"
import prisma from "../prisma"
import { handlePrismaError } from "../helper/prisma.helper"
import { decryptAll, safeDecrypt } from "../utils/crypto.util"
import { calculateAge } from "../helper/agecalculator.helper"
import { Prisma } from "@prisma/client"
import csv from "csv-parser";
import { Readable } from "stream";
import { csvToResidentBulkMapper } from "../utils/csvMapper";
import { generateBulkResidentIds } from "../utils/bulkResidentIdGenerator";
import { lowercaseDeep } from "../helper/lowercase.helper"
import { hashEmail } from "../utils/hash.util"

const BATCH_SIZE = 500;
/* CREATE */
export const createResident = async (
  req: Request<{}, {}, Prisma.residentsCreateInput>,
  res: Response
): Promise<void> => {
  try {

    // Await hashing for h_email_address
    const h_email_address = req.body.email_address
      ?  hashEmail(safeDecrypt(req.body.email_address.toLowerCase()))
      : null;

    // Prepare data object
    const data = lowercaseDeep({
      ...req.body,
      b_date: req.body.b_date ? new Date(req.body.b_date).toISOString() : null,
      h_email_address,
    });



    // Insert into DB
    const resident = await prisma.residents.create({ data });
    res.status(201).json(resident);
  } catch (err) {
    handlePrismaError(err, res);
  }
};

export const createResidentsFromCSV = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "CSV file is required" })
      return
    }

    // 1️⃣ Fetch all puroks once
    const puroks = await prisma.purok.findMany({
      select: { id: true, name: true },
    })

    const purokMap: Record<string, string> = {}
    puroks.forEach((p) => {
      purokMap[p.name.trim()] = p.id
    })

    const stream = Readable.from(req.file.buffer)

    let buffer: ReturnType<typeof csvToResidentBulkMapper>[] = []
    let insertedCount = 0
    let skippedCount = 0

    // 2️⃣ Flush batch function
    const flush = async () => {
      if (!buffer.length) return

      // Generate bulk IDs for this batch
      const ids = await generateBulkResidentIds({ count: buffer.length })

      // Assign IDs to each row
      const batch = buffer.map((mapped, index) => ({
        ...mapped,
        resident_id: ids[index],
      }))

      // Bulk insert
      await prisma.residents.createMany({ data: batch })

      insertedCount += batch.length
      buffer = []
    }

    // 3️⃣ Stream CSV
    stream
      .pipe(csv())
      .on("data", async (row) => {
        try {
          // Map CSV row to DB input
          const mapped = csvToResidentBulkMapper(row, purokMap)

          // Skip invalid rows
          if (!mapped.f_name || mapped.f_name === "Unknown") {
            skippedCount++
            return
          }

          buffer.push(mapped)

          // Flush batch if size reached
          if (buffer.length >= BATCH_SIZE) {
            stream.pause()
            await flush()
            stream.resume()
          }
        } catch (err) {
          skippedCount++
          console.error("Row skipped:", row, err)
        }
      })
      .on("end", async () => {
        try {
          // Flush remaining rows
          await flush()

          if (!insertedCount) {
            res.status(400).json({
              message: "No valid rows were inserted",
              skippedCount,
            })
            return
          }

          res.status(201).json({
            message: "Residents imported successfully",
            insertedCount,
            skippedCount,
          })
        } catch (err) {
          console.error(err)
          res.status(500).json({ message: "Failed to insert residents" })
        }
      })
      .on("error", (err) => {
        console.error(err)
        res.status(500).json({ message: "Error reading CSV file" })
      })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
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


 
    // Await hashing for h_email_address
    const h_email_address = req.body.email_address
      ?  hashEmail(safeDecrypt(req.body.email_address.toLowerCase()))
      : null;


    
    const data = lowercaseDeep({
      ...req.body,
      b_date: req.body.b_date ? new Date(req.body.b_date).toISOString() : null,
      h_email_address,
    });

    const resident = await prisma.residents.update({
      where: { id: req.params.id },
      data: data,
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
