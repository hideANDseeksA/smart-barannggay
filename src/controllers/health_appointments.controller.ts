import { Request, Response } from "express";
import prisma from "../prisma";

/* CREATE */
export const createHealthAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthAppointment = await prisma.health_referals.create({
      data: req.body,
    });
    res.status(201).json(healthAppointment);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};

/* READ ALL */
export const getHealthAppointments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const healthAppointments = await prisma.health_referals.findMany();
    res.json(healthAppointments);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};

/* READ ONE */
export const getHealthAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthAppointment = await prisma.health_referals.findUnique({
      where: { id: req.params.id },
    });

    if (!healthAppointment) {
      res.status(404).json({ message: "Health appointment not found" });
      return;
    }

    res.json(healthAppointment);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};

/* UPDATE */
export const updateHealthAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthAppointment = await prisma.health_referals.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(healthAppointment);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};

/* DELETE */
export const deleteHealthAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.health_referals.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Health appointment deleted successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};
