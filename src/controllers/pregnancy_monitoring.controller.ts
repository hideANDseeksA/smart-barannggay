import { Request, Response } from "express"
import prisma from "../prisma"
import { decrypt } from "../utils/crypto.util"

/* CREATE */
export const createPregnancy_monitoring = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = {
      ...req.body,
      pregnancy_start_date: req.body.pregnancy_start_date
        ? new Date(req.body.pregnancy_start_date)
        : null,
      expected_delivery_date: req.body.expected_delivery_date
        ? new Date(req.body.expected_delivery_date)
        : null,
      last_checkup: req.body.last_checkup
        ? new Date(req.body.last_checkup)
        : null,
    }

    const pregnancy_monitoring = await prisma.pregnancy_monitoring.create({
      data,
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

      orderBy: {
        created_at: "desc" // optional but recommended
      }
    });

    // Decrypt first
    
    // 🔹 GROUP BY health_record_id
    

    res.json(pregnancy_monitoring);
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
      data: {
        ...req.body,
        pregnancy_start_date: req.body.pregnancy_start_date
          ? new Date(req.body.pregnancy_start_date)
          : null,
        expected_delivery_date: req.body.expected_delivery_date
          ? new Date(req.body.expected_delivery_date)
          : null,
        last_checkup: req.body.last_checkup
          ? new Date(req.body.last_checkup)
          : null,
      },
    });

    res.json(pregnancy_monitoring);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};

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
