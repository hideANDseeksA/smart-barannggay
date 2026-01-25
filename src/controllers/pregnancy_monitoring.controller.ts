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
      },
      orderBy: {
        created_at: "desc" // optional but recommended
      }
    });

    // Decrypt first
    const decryptedData = pregnancy_monitoring.map(pm => {
      if (!pm.health_record) return pm;

      const hr = pm.health_record;
      const resident = hr.resident;

      return {
        ...pm,
        health_record: {
          ...hr,
          blood_type: hr.blood_type ? decrypt(hr.blood_type) : null,
          allergies: hr.allergies ? decrypt(hr.allergies) : null,
          chronic_conditions: hr.chronic_conditions ? decrypt(hr.chronic_conditions) : null,
          resident: resident
            ? {
                id: resident.id,
                resident_id: resident.resident_id,
                f_name: resident.f_name ? decrypt(resident.f_name) : null,
                l_name: resident.l_name ? decrypt(resident.l_name) : null,
                m_name: resident.m_name ? decrypt(resident.m_name) : null,
              }
            : null
        }
      };
    });

    // 🔹 GROUP BY health_record_id
    const groupedData = decryptedData.reduce((acc: any, pm: any) => {
      const healthId = pm.health_record_id;

      if (!acc[healthId]) {
        acc[healthId] = {
          health_record_id: healthId,
          health_record: pm.health_record,
          monitoring_records: []
        };
      }

      acc[healthId].monitoring_records.push({
        ...pm,
        health_record: undefined // avoid duplication
      });

      return acc;
    }, {});

    res.json(Object.values(groupedData));
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
