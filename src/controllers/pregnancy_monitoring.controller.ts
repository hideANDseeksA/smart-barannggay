import { Request, Response } from "express"
import prisma from "../prisma"
import { decrypt } from "../utils/crypto.util"

/* CREATE */
export const createPregnancy_monitoring = async (req: Request, res: Response): Promise<void> => {
  try {
    const pregnancy_monitoring = await prisma.pregnancy_monitoring.create({
      data: req.body,
    })
    res.status(201).json(pregnancy_monitoring)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* READ ALL */
export const getPregnancy_monitoring = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pregnancy_monitoring = await prisma.pregnancy_monitoring.findMany({
      include: {
        health_record: {
          include: {
            resident: true
          }
        }
      }
    });

    // Decrypt relevant fields
    const decryptedData = pregnancy_monitoring.map(pm => {
      if (pm.health_record) {
        const hr = pm.health_record;
        const resident = hr.resident;

        return {
          ...pm,
          health_record: {
            blood_type: hr.blood_type ? decrypt(hr.blood_type) : null,
            allergies: hr.allergies ? decrypt(hr.allergies) : null,
            chronic_conditions: hr.chronic_conditions ? decrypt(hr.chronic_conditions) : null,
            resident: resident
              ? {
                  f_name: resident.f_name ? decrypt(resident.f_name) : null,
                  l_name: resident.l_name ? decrypt(resident.l_name) : null,
                  m_name: resident.m_name ? decrypt(resident.m_name) : null,
                  contact_no: resident.contact_no ? decrypt(resident.contact_no) : null
                }
              : null
          }
        };
      }
      return pm;
    });

    res.json(decryptedData);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};

/* READ ONE */
export const getPregnancy_monitoringById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pregnancy_monitoring = await prisma.pregnancy_monitoring.findMany({
      where: { health_record_id: req.params.id },
    })

    if (!pregnancy_monitoring) {
      res.status(404).json({ message: "pregnancy_monitoring not found" })
      return
    }

    res.json(pregnancy_monitoring)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* UPDATE */
export const updatePregnancy_monitoring = async (req: Request, res: Response): Promise<void> => {
  try {
    const pregnancy_monitoring = await prisma.pregnancy_monitoring.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(pregnancy_monitoring)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* DELETE */
export const deletePregnancy_monitoring = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.pregnancy_monitoring.delete({
      where: { id: req.params.id },
    })
    res.json({ message: "pregnancy_monitoring deleted successfully" })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}
