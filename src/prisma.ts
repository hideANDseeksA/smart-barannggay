import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"
dotenv.config()

// PrismaClient automatically uses `directUrl` from schema.prisma
const prisma = new PrismaClient()

export default prisma
