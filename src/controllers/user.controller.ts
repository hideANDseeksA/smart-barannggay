import { Request, Response } from "express";
import prisma from "../prisma";

/**
 * Create user
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.create({
      data: req.body,
    });

    return res.status(201).json(user);
  } catch (err: any) {
    console.error(err);

    // Prisma unique constraint or conflict
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "User already exists",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/**
 * Get all users
 */
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
